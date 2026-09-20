# CoinPeas Static

A small serverless cryptocurrency website hosted entirely on Cloudflare.

The public website is **100% static**. Every asset is a content-hashed file produced by the Vite build, so normal visitors never invoke Worker code — Cloudflare serves static asset requests directly from the edge, for free, regardless of traffic volume.

## Architecture

```text
                         CoinGecko
                             │
                         on a schedule
                             │
                             ▼
                  ┌───────────────────────┐
                  │ GitHub Actions        │
                  │ scheduled workflow    │
                  │ (fetch → build →      │
                  │  deploy, every run)   │
                  └───────────┬───────────┘
                              │
                              ▼
                    Cloudflare Static Assets
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
          index.html    assets/index-*.js  assets/coins-*.js
               │              │              │
               └──────────────┴──────────────┘
                              │
                              ▼
                          Visitors
```

`coinpeas` is an assets-only Worker (no `main` script) — it just serves static assets, so there's no application code on the read path. All data refreshing happens outside Cloudflare, in a GitHub Actions cron workflow that fetches fresh coin data and redeploys on a schedule (see [Cron schedule](#cron-schedule)). `wrangler deploy` computes the static asset manifest itself — no hand-rolled Cloudflare API calls or asset-hash bookkeeping.

`src/coins.json` is inlined straight into `index.html` as `window.__COINS__`, by a `transformIndexHtml` plugin in `vite.config.js`, rather than fetched over HTTP or imported as its own chunk. `index.html` is served un-hashed and revalidated on every visit anyway (it's what points visitors at the current asset hashes after each deploy), so baking the data into it costs nothing in cacheability and saves app.js a round trip to fetch the data separately after it loads.

## Setup

Requirements: Node.js, npm, a Cloudflare account with a domain managed by Cloudflare, and a GitHub repository for the scheduled Actions workflow.

```bash
npm install
```

### Hostname

The apex domain is bound as a custom domain in `wrangler.jsonc`, so Cloudflare provisions DNS/TLS for it and routes it to this Worker:

```json
"routes": [
  {
    "pattern": "coinpeas.com",
    "custom_domain": true
  }
]
```

This route is currently commented out in `wrangler.jsonc` until `coinpeas.com` is actually registered and added as a Cloudflare zone — until then, deploys publish to the free `coinpeas.<account-subdomain>.workers.dev` instead.

### GitHub Actions secrets and variables

The workflow reads a few values from the GitHub repository itself, not from any file in this repo. They live under **Settings → Secrets and variables → Actions**, split across two tabs:

- **Secrets** — for sensitive values. Encrypted at rest, and GitHub never shows the value again after you save it.
- **Variables** — for plain, non-sensitive config. Visible in the UI, so use this for anything that doesn't need to be hidden.

**Secrets** (add each with **New repository secret**):

| Name | Required? | What it's for |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Yes | Lets the workflow run `wrangler deploy`. Create one in the Cloudflare dashboard with `Account → Workers Scripts → Edit` permission. |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Your Cloudflare account ID. Not actually sensitive, but kept as a secret anyway since that's where `wrangler-action` looks for it. |
| `COINGECKO_API_KEY` | No | Raises CoinGecko's rate limit. The public API works fine without one — only add this if you start hitting limits. Sent as the `x-cg-demo-api-key` header; the frontend never sees it. |

**Variables** (add with **New repository variable**):

| Name | Required? | What it's for |
|---|---|---|
| `DEPLOY_ENABLED` | Yes, once you're ready to go live | The workflow's deploy step only runs when this is set to exactly `true`. Until then, it's skipped instead of failing — so you can push this repo (and let the scheduled fetch run) before the Cloudflare secrets above even exist, without every run failing at the deploy step. |

Once all three secrets and the `DEPLOY_ENABLED` variable are set, the next scheduled run (or a manual one via **Actions → Update coin data → Run workflow**) will deploy for real.

## Update flow

On each scheduled run, `.github/workflows/update-coins.yml`:

1. Checks out the repo.
2. `npm run fetch-coins` — fetches the top 100 coins from CoinGecko (with a timeout and retries) and overwrites `src/coins.json`, trimmed to just the fields the frontend renders. This runs *before* the build, since Vite reads `src/coins.json` at build time to inline it into `index.html`.
3. `npm ci` + `npm run build` (Vite) — rebuilds `dist/` from scratch. This runs on every scheduled run now, since coin data changes (and therefore the build output) on almost every run — there's no longer a data-only update path that can skip straight to deploy.
4. `wrangler deploy` uploads `dist/` as a new `coinpeas` version.

You can also run this same sequence manually at any time with `npm run deploy`, e.g. to push a code change immediately without waiting for the next scheduled run.

## Cron schedule

`.github/workflows/update-coins.yml` uses:

```yaml
schedule:
  - cron: "*/15 * * * *"
```

This runs on the interval set above, in UTC. GitHub Actions schedules can lag under load, so treat that interval as a target, not a guarantee.

The interval comfortably stays within CoinGecko's free "Demo" plan limits: 100 requests/minute and 10,000 call credits/month. At one request per run, only a very short interval (a handful of minutes) would meaningfully risk the monthly cap — there's plenty of headroom for manual `workflow_dispatch` runs or a shorter interval later if needed.

On a public repository, GitHub Actions minutes are unlimited and free. On a private repository, factor in the ~2,000 free minutes/month and widen the interval if needed.

## Static asset caching

`public/_headers` marks everything under `assets/*` as immutable and cacheable for a year:

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

This is safe because every file in `assets/` has a content hash in its filename. A stale cached copy is never served, because a change in content always means a new URL; `index.html` (not covered by this rule, so it's revalidated normally) is what points visitors at the current hashes — and the current coin data — after each deploy.

## Cost/scaling model

Normal visitor requests are served as Cloudflare Static Assets — there is no Worker application logic on the read path, so public traffic can grow without turning page views into billed Worker executions. The only recurring cost surface is the GitHub Actions workflow, which runs outside Cloudflare entirely.

## Local development

Run the Vite development server:

```bash
npm run dev
```

This renders the static `src/coins.json` fixture as-is — dev intentionally never fetches live data, so it stays fast and deterministic regardless of CoinGecko's availability or rate limits. `npm run fetch-coins` is reserved for deploys and always targets `src/coins.json`; running it locally would overwrite the git-tracked fixture, so only do that deliberately (e.g. after changing which fields `fetch-coins.mjs` keeps) and review the diff before committing:

```bash
npm run fetch-coins
```

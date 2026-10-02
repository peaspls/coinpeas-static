# CoinPeas Static

A small, serverless site showing the top 20 cryptocurrencies by market cap, hosted entirely on Cloudflare.

Built for lightweight network use, where every kilobyte counts: no frameworks, no trackers, no unnecessary requests — just the data, built with efficiency in mind.

The public website is **100% static** — Cloudflare serves every request directly from the edge as a static asset, so normal visitors never invoke Worker code, for free, regardless of traffic volume. The architecture was deliberately chosen to keep it that way, with no servers to run or pay for.

Nearly all of the code, and this README, was written by AI (Claude), directed toward a specific intended outcome and reviewed in detail rather than accepted as-is. Design decisions, tradeoffs, and correctness remain a human responsibility throughout.

## Architecture

```text
                   coinpeas-cron Worker
                  (Cloudflare Cron Trigger)
                             │
              every-3-hours workflow_dispatch
                             │
                             ▼
                  ┌───────────────────────┐
                  │ GitHub Actions        │   ◄── CoinGecko
                  │ deploy workflow       │
                  │ (fetch → build →      │
                  │  deploy, every run)   │
                  └───────────┬───────────┘
                              │
                              ▼
                    Cloudflare Static Assets
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
          index.html      assets/*        fonts/*
      (coin data inlined) (JS, CSS,      (self-hosted
                            favicon)         Inter)
               │              │              │
               └──────────────┴──────────────┘
                              │
                              ▼
                          Visitors
```

`coinpeas` is an assets-only Worker — it just serves static files, with no application code on the read path. A GitHub Actions workflow does all the real work outside Cloudflare: fetching fresh coin data, rebuilding the site, and redeploying it. A separate, tiny `coinpeas-cron` Worker starts that workflow every three hours (see [Cron schedule](#cron-schedule)); it runs only on its schedule and serves no requests. Redeploying on every update, rather than running a live backend, means there's no origin server to operate — Cloudflare's edge network caches and serves the static output worldwide, and the GitHub Actions workflow is the only recurring cost surface.

`data/coins.json` is inlined directly into `index.html` at build time instead of being fetched separately. `index.html` is already revalidated on every visit (it's what points visitors at the current asset hashes), so this adds no cacheability cost and saves an extra request.

## Static asset caching

`public/_headers` marks `assets/*` and `fonts/*` as immutable and cacheable for a year:

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

`assets/*` is safe because every file there has a content hash in its filename — a change in content always means a new URL, so a stale cached copy is never served. `fonts/*` isn't hashed, but the font files are static and not expected to change; if they ever do, rename the file (and update the `@font-face`/preload references in `styles.css`/`index.html`) rather than relying on cache invalidation. `index.html` isn't covered by either rule, so it's revalidated normally — that's what points visitors at the current asset hashes, and the current coin data, after each deploy.

## Deployment

Requirements: a Cloudflare account with a domain managed by Cloudflare, and a GitHub repository for the scheduled Actions workflow.

### Setup

#### GitHub Actions secrets and variables

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

Once all three secrets and the `DEPLOY_ENABLED` variable are set, the next scheduled run (or a manual one via **Actions → Deploy → Run workflow**) will deploy for real.

### Update flow

On each run, `.github/workflows/deploy.yml`:

1. Checks out the repo.
2. `npm run fetch-coins` — fetches the top 20 coins from CoinGecko (with a timeout and retries) and overwrites `data/coins.json`, trimmed to just the fields the frontend renders. This runs *before* the build, since Vite reads `data/coins.json` at build time to inline it into `index.html`.
3. `npm ci` + `npm run build` (Vite) — rebuilds `dist/` from scratch. This runs on every scheduled run now, since coin data changes (and therefore the build output) on almost every run — there's no longer a data-only update path that can skip straight to deploy.
4. `wrangler deploy` uploads `dist/` as a new `coinpeas` version.

You can also run this same sequence manually at any time with `npm run deploy`, e.g. to push a code change immediately without waiting for the next scheduled run.

### Cron schedule

The workflow has no GitHub `schedule:` trigger, since those can start late or skip runs under load. Instead, the `coinpeas-cron` Worker in `cron/` uses a Cloudflare Cron Trigger to call GitHub's `workflow_dispatch` API:

```jsonc
"triggers": {
  "crons": ["10 */3 * * *"]
}
```

That's ten past every third hour (00:10, 03:10, 06:10, …), in UTC. It's deliberately off the top of the hour, when cron schedulers are busiest. Each run's deploy message in Cloudflare reads "GitHub Actions (scheduled by Cloudflare Worker coinpeas-cron) deploy", so you can tell these runs apart from manual ones.

One-time setup:

1. On GitHub, create a **fine-grained personal access token** (**Settings → Developer settings → Personal access tokens → Fine-grained tokens**) with access to only this repository and only the **Actions: Read and write** permission. If it leaks, the worst anyone can do with it is start this workflow.
2. Store it as a Worker secret (Wrangler prompts for the value):
   ```bash
   npx wrangler secret put GITHUB_TOKEN --config cron/wrangler.jsonc
   ```
3. Deploy the Worker:
   ```bash
   npm run deploy-cron
   ```

It only needs redeploying if `cron/` changes, not on every site deploy. Runs and failures show in the Cloudflare dashboard under the `coinpeas-cron` Worker's logs. When the token expires, the scheduled runs stop until you repeat steps 1–2.

#### Free plan limits

Both Workers fit comfortably in Cloudflare's free Workers plan ([limits](https://developers.cloudflare.com/workers/platform/limits/), [pricing](https://developers.cloudflare.com/workers/platform/pricing/)):

| Free plan limit | What this project uses |
|---|---|
| Static asset requests: free and unlimited | Every visitor request to the site. The `coinpeas` Worker only serves assets, so visitors never run Worker code. |
| 100,000 Worker requests/day | 8 cron runs/day from `coinpeas-cron`, even if every run counts. |
| 10 ms CPU time per invocation (cron runs included) | Well under 1 ms: one `fetch` call. Waiting for GitHub's response doesn't count as CPU time. |
| 5 Cron Triggers per account | 1 |
| 100 Workers per account | 2 (`coinpeas` and `coinpeas-cron`) |

So the cron could run every minute (1,440 runs a day) and stay far under the request limit. The real limits on how often it can run are GitHub Actions and CoinGecko's API quota (below).

The interval comfortably stays within CoinGecko's free "Demo" plan limits: 100 requests/minute and 10,000 call credits/month. At one request per run, only a very short interval (a handful of minutes) would meaningfully risk the monthly cap — there's plenty of headroom for manual `workflow_dispatch` runs or a shorter interval later if needed.

On a public repository, GitHub Actions minutes are unlimited and free. On a private repository, factor in the ~2,000 free minutes/month and widen the interval if needed.

## Local development

Requirements: Node.js and npm.

```bash
npm install
```

Run the Vite development server:

```bash
npm run dev
```

This renders the static `data/coins.json` fixture as-is — dev intentionally never fetches live data, so it stays fast and deterministic regardless of CoinGecko's availability or rate limits. `npm run fetch-coins` is reserved for deploys and always targets `data/coins.json`; running it locally would overwrite the git-tracked fixture, so only do that deliberately (e.g. after changing which fields `fetch-coins.mjs` keeps) and review the diff before committing:

```bash
npm run fetch-coins
```

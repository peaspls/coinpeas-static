// coinpeas-cron: a scheduled-only Worker that starts the "Deploy"
// GitHub Actions workflow every three hours (see the cron in ./wrangler.jsonc).
// It has no fetch handler and isn't reachable over HTTP; it just makes one
// API call per run. The site itself is served by the separate `coinpeas`
// assets-only Worker in the repo root, which this never touches.
const DISPATCH_URL =
  "https://api.github.com/repos/peaspls/coinpeas-static/actions/workflows/deploy.yml/dispatches";

export default {
  async scheduled(_controller, env) {
    const response = await fetch(DISPATCH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // GitHub rejects API requests without a User-Agent, and Workers'
        // fetch doesn't send one by default.
        "User-Agent": "coinpeas-cron",
      },
      // `trigger` ends up in the deploy message, so each deploy says what
      // started it.
      body: JSON.stringify({ ref: "main", inputs: { trigger: "Cloudflare coinpeas-cron" } }),
    });

    // Throwing marks this cron run as failed in the Worker's logs.
    if (!response.ok) {
      throw new Error(`GitHub returned HTTP ${response.status}: ${await response.text()}`);
    }
  },
};

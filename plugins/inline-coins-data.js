// A Vite plugin that inlines the coin data into index.html.
import { readFileSync } from "node:fs";
import path from "node:path";

const COINS_PATH = new URL("../data/coins.json", import.meta.url);

// The fields src/app.js renders. CoinGecko's coins carry ~30 fields (ath,
// atl, supply figures, a 7-day sparkline, ...) that would otherwise be
// downloaded by every visitor for no reason.
const FIELDS = [
  "market_cap_rank",
  "name",
  "symbol",
  "current_price",
  "price_change_percentage_24h",
  "market_cap",
];

// Keeps only FIELDS, columnar (one array per field) rather than one object
// per coin: each name appears once, and grouping same-typed values together
// compresses better than interleaving them row by row.
function trimCoins({ source, generated_at, coins }) {
  return {
    source,
    generated_at,
    coins: Object.fromEntries(FIELDS.map((field) => [field, coins.map((coin) => coin[field])])),
  };
}

/**
 * Vite plugin that bakes the trimmed data/coins.json straight into
 * index.html as a global (window.__COINS__), via the transformIndexHtml
 * hook. Vite calls the hook on every dev-server request and once at build
 * time, so the page always reflects whatever is currently in
 * data/coins.json. Only index.html gets it; the other pages don't use the
 * coin data.
 *
 * @returns {import("vite").Plugin}
 */
export function inlineCoinsData() {
  return {
    name: "inline-coins-data",
    transformIndexHtml(html, ctx) {
      if (path.basename(ctx.filename) !== "index.html") return;
      // Throws (failing the build, or the dev request) if coins.json is
      // malformed.
      const json = JSON.stringify(trimCoins(JSON.parse(readFileSync(COINS_PATH, "utf-8"))));
      // Coin names/symbols come from an external API — escape "<" so a
      // value containing "</script>" or "<!--" can't break out of the tag.
      const safeJson = json.replace(/</g, "\\u003c");
      return [
        {
          tag: "script",
          injectTo: "head",
          children: `window.__COINS__ = ${safeJson};`,
        },
      ];
    },
  };
}

// Fetches the top 100 coins by market cap from CoinGecko and writes them to
// the path given as the first CLI arg — see
// `npm run deploy` and .github/workflows/update-coins.yml). This must run
// *before* `vite build`, since app.js imports coins.json and Vite bakes its
// contents into a hashed chunk at build time. No default path: local dev
// intentionally renders the static src/coins.json fixture as-is and should
// never fetch live data as a side effect of some other command.
import { writeFile, rename } from "node:fs/promises";
import path from "node:path";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

if (!process.argv[2]) {
  throw new Error("Usage: node scripts/fetch-coins.mjs <output-path>");
}
const OUTPUT_PATH = path.resolve(process.argv[2]);
// Keep well under the 10-minute cron interval: the workflow doesn't cancel an
// in-progress run when the next one fires, so a slow request must still fail
// fast enough that retries and the next scheduled run aren't blocked behind it.
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

const headers = {};
if (process.env.COINGECKO_API_KEY) {
  // Header name (rather than a query param or Bearer token) is CoinGecko's
  // own scheme for its free/demo API tier.
  headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCoins() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(COINGECKO_URL, {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`CoinGecko returned HTTP ${response.status}: ${body}`);
      }

      const coins = await response.json();
      if (!Array.isArray(coins) || coins.length === 0) {
        throw new Error("CoinGecko returned an empty or invalid coin list");
      }

      // Keep only the fields src/app.js renders, plus last_updated (not
      // rendered yet, but kept since CoinGecko's own cache means a coin's
      // price can be older than this script's generated_at) — CoinGecko's
      // raw objects carry ~25 fields (ath, atl, supply figures, roi, ...)
      // that would otherwise be downloaded by every visitor for no reason.
      return coins.map((coin) => ({
        market_cap_rank: coin.market_cap_rank,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        last_updated: coin.last_updated,
      }));
    } catch (error) {
      // Retry on any failure (network error, timeout, bad status, malformed
      // body) rather than special-casing which ones are "retryable" — at
      // this call volume, a blanket retry is simpler and just as effective.
      if (attempt === MAX_ATTEMPTS) throw error;
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`);
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
}

const coins = await fetchCoins();

const output = {
  source: "CoinGecko",
  generated_at: new Date().toISOString(),
  coins,
};

// Write then rename so a crash mid-write can't leave a truncated coins.json.
const tmpPath = `${OUTPUT_PATH}.tmp`;
await writeFile(tmpPath, JSON.stringify(output));
await rename(tmpPath, OUTPUT_PATH);

console.log(`Wrote ${coins.length} coins to ${OUTPUT_PATH}`);

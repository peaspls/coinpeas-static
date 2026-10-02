// Fetches the top 20 coins by market cap from CoinGecko and writes them to
// the path given as the first CLI arg. There's no default path, so it never
// overwrites a file unless told which one.
import { writeFile, rename } from "node:fs/promises";
import path from "node:path";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

if (!process.argv[2]) {
  throw new Error("Usage: node scripts/fetch-coins.mjs <output-path>");
}
const OUTPUT_PATH = path.resolve(process.argv[2]);
// Per attempt, so a hung request fails fast enough to leave time to retry.
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

// The fields kept per coin, written out columnar (see below) so each name
// appears once in the output file, not once per coin.
const FIELDS = [
  "market_cap_rank",
  "name",
  "symbol",
  "current_price",
  "price_change_percentage_24h",
  "market_cap",
  "total_volume",
];

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

      // Keep only the fields src/app.js renders — CoinGecko's raw objects
      // carry ~25 fields (ath, atl, supply figures, roi, last_updated, ...)
      // that would otherwise be downloaded by every visitor for no reason.
      // Written columnar (one array per field, see FIELDS above) rather than
      // one object per coin: grouping same-typed values together compresses
      // better than interleaving them row by row.
      return Object.fromEntries(
        FIELDS.map((field) => [field, coins.map((coin) => coin[field])])
      );
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
const coinCount = coins[FIELDS[0]].length;

const output = {
  source: "CoinGecko",
  generated_at: new Date().toISOString(),
  coins,
};

// Write then rename so a crash mid-write can't leave a truncated output file.
const tmpPath = `${OUTPUT_PATH}.tmp`;
await writeFile(tmpPath, JSON.stringify(output));
await rename(tmpPath, OUTPUT_PATH);

console.log(`Wrote ${coinCount} coins to ${OUTPUT_PATH}`);

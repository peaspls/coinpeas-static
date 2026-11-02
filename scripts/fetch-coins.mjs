// Fetches the top 50 coins by market cap from CoinGecko and writes them, just
// as CoinGecko returns them, to the path given as the first CLI arg. There's
// no default path, so it never overwrites a file unless told which one.
//
// Usage: node scripts/fetch-coins.mjs <output-path> [--if-missing]
//
// With --if-missing, it does nothing when the output file already exists.
// It creates the output file's folder if needed.
//
// Set COINGECKO_API_KEY to send a CoinGecko demo API key with the request;
// without one it uses the keyless public API.
import { existsSync } from "node:fs";
import { mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";

// The top 50 coins priced in US dollars, largest market cap first. Each coin
// also comes with a 7-day price sparkline and its price change over the last
// hour, 7 days and 30 days, on top of the 24-hour change it always has.
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true" +
  "&price_change_percentage=1h,7d,30d";

const args = process.argv.slice(2);
const IF_MISSING = args.includes("--if-missing");
const outputArg = args.find((arg) => !arg.startsWith("--"));
if (!outputArg) {
  throw new Error("Usage: node scripts/fetch-coins.mjs <output-path> [--if-missing]");
}
const OUTPUT_PATH = path.resolve(outputArg);

if (IF_MISSING && existsSync(OUTPUT_PATH)) {
  console.log(`${OUTPUT_PATH} already exists, not fetching`);
  process.exit(0);
}

// Per attempt, so a hung request fails fast enough to leave time to retry.
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
// The wait grows with each failed attempt: 2 s after the first, 4 s after
// the second.
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

// Returns CoinGecko's list of coins, one object per coin, trying up to
// MAX_ATTEMPTS times. Throws the last error if every attempt fails, which
// exits the script with a non-zero status.
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

      return coins;
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

// The coins plus where they came from and when they were fetched, as an ISO
// 8601 timestamp in UTC.
const output = {
  source: "CoinGecko",
  generated_at: new Date().toISOString(),
  coins,
};

// Write then rename so a crash mid-write can't leave a truncated output file.
// Indented, so a change to the data reads clearly in a diff.
const tmpPath = `${OUTPUT_PATH}.tmp`;
await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(tmpPath, JSON.stringify(output, null, 2));
await rename(tmpPath, OUTPUT_PATH);

console.log(`Wrote ${coins.length} coins to ${OUTPUT_PATH}`);

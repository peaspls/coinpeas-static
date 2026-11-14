// A Vite plugin that makes one small details file per coin.
import { readFileSync } from "node:fs";

const COINS_PATH = new URL("../data/coins.json", import.meta.url);

// The fields in each details file, in this order, followed by the 7-day
// sparkline. Written as a plain array rather than an object, so the field
// names aren't sent with every file.
const DETAIL_FIELDS = ["price_change_percentage_7d_in_currency"];

// CoinGecko's sparkline has one price per hour. Every fourth one, ending on
// the latest, at 4 significant digits, is plenty for a small chart.
const SPARKLINE_STEP = 4;
const SPARKLINE_PRECISION = 4;

function readCoins() {
  return JSON.parse(readFileSync(COINS_PATH, "utf-8"));
}

// The folder for one set of coin data: its generated_at time in
// milliseconds, so every fetch of the data gets its own folder.
function folderOf(data) {
  return String(Date.parse(data.generated_at));
}

function detailsOf(coin) {
  const prices = coin.sparkline_in_7d?.price ?? [];
  const sparkline = prices
    .filter((_, i) => (prices.length - 1 - i) % SPARKLINE_STEP === 0)
    .map((price) => Number(price.toPrecision(SPARKLINE_PRECISION)));
  const values = DETAIL_FIELDS.map((field) => coin[field] ?? null);
  return JSON.stringify([...values, sparkline]);
}

/**
 * Vite plugin that writes each coin's details to
 * coins/<generated_at in ms>/<position in the list>.json, for the page to
 * fetch when a coin is opened. The build writes them all into the output;
 * the dev server makes each one on request, from whatever is currently in
 * data/coins.json, and answers 404 for any other folder, as the deployed
 * site does once the data has moved on.
 *
 * @returns {import("vite").Plugin}
 */
export function coinDetails() {
  return {
    name: "coin-details",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url.match(/^\/coins\/(\d+)\/(\d+)\.json$/);
        if (!match) return next();
        const data = readCoins();
        const coin = data.coins[Number(match[2])];
        if (match[1] !== folderOf(data) || !coin) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(detailsOf(coin));
      });
    },
    generateBundle() {
      const data = readCoins();
      const folder = folderOf(data);
      data.coins.forEach((coin, i) => {
        this.emitFile({ type: "asset", fileName: `coins/${folder}/${i}.json`, source: detailsOf(coin) });
      });
    },
  };
}

// A Vite plugin that makes one small details file per coin.
import { readFileSync } from "node:fs";
import path from "node:path";

// The folder for one set of coin data: its generated_at time in
// milliseconds, so every fetch of the data gets its own folder.
function folderOf(data) {
  return String(Date.parse(data.generated_at));
}

/**
 * Vite plugin that writes each coin's details to
 * <dir>/<generated_at in ms>/<position in the list>.json, for the page to
 * fetch when a coin is opened. Each file is a plain array: the values of
 * `fields`, in that order, followed by the coin's 7-day sparkline, so the
 * field names aren't sent with every file. The sparkline keeps every
 * `sparklineStep`-th price, ending on the latest, rounded to
 * `sparklinePrecision` significant digits.
 *
 * The build writes them all into the output; the dev server makes each one
 * on request, from whatever is currently in the data file, and answers 404
 * for any other folder, as the deployed site does once the data has moved on.
 *
 * @param {object} options
 * @param {string} options.data Path to the coin data, relative to Vite's root.
 * @param {string} options.dir Output folder, and the URL path it's served at.
 * @param {string[]} options.fields Coin fields to write before the sparkline.
 * @param {number} options.sparklineStep Keep every this many prices.
 * @param {number} options.sparklinePrecision Significant digits per price.
 * @returns {import("vite").Plugin}
 */
export function coinDetails({ data, dir, fields, sparklineStep, sparklinePrecision }) {
  let dataPath;
  const urlPattern = new RegExp(`^/${dir}/(\\d+)/(\\d+)\\.json$`);

  const readCoins = () => JSON.parse(readFileSync(dataPath, "utf-8"));

  function detailsOf(coin) {
    const prices = coin.sparkline_in_7d?.price ?? [];
    const sparkline = prices
      .filter((_, i) => (prices.length - 1 - i) % sparklineStep === 0)
      .map((price) => Number(price.toPrecision(sparklinePrecision)));
    const values = fields.map((field) => coin[field] ?? null);
    return JSON.stringify([...values, sparkline]);
  }

  return {
    name: "coin-details",
    configResolved(config) {
      dataPath = path.resolve(config.root, data);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url.match(urlPattern);
        if (!match) return next();
        const coins = readCoins();
        const coin = coins.coins[Number(match[2])];
        if (match[1] !== folderOf(coins) || !coin) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(detailsOf(coin));
      });
    },
    generateBundle() {
      const coins = readCoins();
      const folder = folderOf(coins);
      coins.coins.forEach((coin, i) => {
        this.emitFile({ type: "asset", fileName: `${dir}/${folder}/${i}.json`, source: detailsOf(coin) });
      });
    },
  };
}

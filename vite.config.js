import { defineConfig } from "vite";
import { coinDetails } from "./plugins/coin-details.js";
import { inlineCoinsData } from "./plugins/inline-coins-data.js";

// The site's pages, each built from its own HTML file. Every page gets its
// own hashed script and stylesheet in assets/. The dev server serves /riddle
// and /game from riddle.html and game.html by itself, the way the deployed
// site does.
const PAGES = ["index", "riddle", "game"];

// The coins as CoinGecko returns them, saved by scripts/fetch-coins.mjs.
const COINS_DATA = "data/coins.json";

export default defineConfig({
  plugins: [
    // The coin list src/app.js renders, read from window.__COINS__. CoinGecko's
    // coins carry ~30 fields (ath, atl, supply figures, a 7-day sparkline, ...);
    // only these are sent.
    inlineCoinsData({
      data: COINS_DATA,
      page: "index.html",
      global: "__COINS__",
      fields: ["market_cap_rank", "name", "symbol", "current_price", "price_change_percentage_24h", "market_cap"],
    }),
    // The details src/app.js fetches from /coins/ when a coin is opened, in
    // the order of the destructuring in its renderDetails. CoinGecko's
    // sparkline has one price per hour; every fourth one (SPARKLINE_STEP_MS
    // in src/app.js) at 4 significant digits is plenty for a small chart.
    coinDetails({
      data: COINS_DATA,
      dir: "coins",
      fields: ["price_change_percentage_7d_in_currency"],
      sparklineStep: 4,
      sparklinePrecision: 4,
    }),
  ],
  build: {
    // Every supported browser handles module preloading natively; without
    // the polyfill each page loads exactly one script of its own.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((page) => [page, `${page}.html`])),
    },
  },
});

import { defineConfig } from "vite";
import { inlineCoinsData } from "./plugins/inline-coins-data.js";

// The site's pages, each built from its own HTML file. Every page gets its
// own hashed script and stylesheet in assets/. The dev server serves /riddle
// and /game from riddle.html and game.html by itself, the way the deployed
// site does.
const PAGES = ["index", "riddle", "game"];

export default defineConfig({
  plugins: [inlineCoinsData()],
  build: {
    // Every supported browser handles module preloading natively; without
    // the polyfill each page loads exactly one script of its own.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((page) => [page, `${page}.html`])),
    },
  },
});

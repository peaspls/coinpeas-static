import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const COINS_PATH = new URL("./data/coins.json", import.meta.url);

// Bakes coins.json straight into index.html as a global (window.__COINS__)
// via the transformIndexHtml hook. Vite calls this on every dev-server
// request and once at build time, so it always reflects whatever is
// currently in data/coins.json. Only index.html gets it; the other pages
// don't use the coin data.
function inlineCoinsData() {
  return {
    name: "inline-coins-data",
    transformIndexHtml(html, ctx) {
      if (path.basename(ctx.filename) !== "index.html") return;
      const json = readFileSync(COINS_PATH, "utf-8");
      JSON.parse(json); // fail fast (build or dev) if coins.json is malformed
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

// The site's pages, each built from its own HTML file. Every page gets its
// own hashed script and stylesheet in assets/.
const PAGES = ["index", "riddle", "game"];

// In the dev server, serve /riddle and /game from riddle.html and game.html,
// the way the deployed site serves them.
function cleanPageUrls() {
  return {
    name: "clean-page-urls",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const match = req.url.match(/^\/([a-z]+)\/?(\?.*)?$/);
        if (match && PAGES.includes(match[1]) && match[1] !== "index") {
          req.url = `/${match[1]}.html${match[2] ?? ""}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [inlineCoinsData(), cleanPageUrls()],
  build: {
    // Every supported browser handles module preloading natively; without
    // the polyfill each page loads exactly one script of its own.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((page) => [page, `${page}.html`])),
    },
  },
});

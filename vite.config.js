import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const COINS_PATH = new URL("./src/coins.json", import.meta.url);

// Bakes coins.json straight into index.html as a global (window.__COINS__)
// via the transformIndexHtml hook. Vite calls this on every dev-server 
// request and once at build time, so it always reflects whatever is 
// currently in src/coins.json.
function inlineCoinsData() {
  return {
    name: "inline-coins-data",
    transformIndexHtml() {
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

export default defineConfig({
  plugins: [inlineCoinsData()],
});

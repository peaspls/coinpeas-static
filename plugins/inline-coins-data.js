// A Vite plugin that inlines the coin data into a page.
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Vite plugin that bakes the coin data straight into one page as a global
 * (window.<global>, so <global> must be a plain identifier), via the transformIndexHtml hook. Vite calls the hook on
 * every dev-server request and once at build time, so the page always
 * reflects whatever is currently in the data file. Other pages are left alone.
 *
 * Only `fields` are kept, columnar (one array per field) rather than one
 * object per coin: each name appears once, and grouping same-typed values
 * together compresses better than interleaving them row by row.
 *
 * @param {object} options
 * @param {string} options.data Path to the coin data, relative to Vite's root.
 * @param {string} options.page File name of the page that gets the data.
 * @param {string} options.global Name of the global the data is assigned to.
 * @param {string[]} options.fields Coin fields to keep.
 * @returns {import("vite").Plugin}
 */
export function inlineCoinsData({ data, page, global, fields }) {
  let dataPath;

  function trimCoins({ source, generated_at, coins }) {
    return {
      source,
      generated_at,
      coins: Object.fromEntries(fields.map((field) => [field, coins.map((coin) => coin[field])])),
    };
  }

  return {
    name: "inline-coins-data",
    configResolved(config) {
      dataPath = path.resolve(config.root, data);
    },
    transformIndexHtml(html, ctx) {
      if (path.basename(ctx.filename) !== page) return;
      // Throws (failing the build, or the dev request) if the data file is
      // malformed.
      const json = JSON.stringify(trimCoins(JSON.parse(readFileSync(dataPath, "utf-8"))));
      // Coin names/symbols come from an external API — escape "<" so a
      // value containing "</script>" or "<!--" can't break out of the tag.
      const safeJson = json.replace(/</g, "\\u003c");
      return [
        {
          tag: "script",
          injectTo: "head",
          children: `window.${global} = ${safeJson};`,
        },
      ];
    },
  };
}

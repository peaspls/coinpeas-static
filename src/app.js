// CoinPeas frontend: plain JS, no framework. The entire page body is
// rendered here rather than living in index.html, so the only markup
// shipped up front is the bare minimum needed to avoid a theme flash (see
// index.html's inline <head> script) — everything else is this file's job.
import {
  BRAND_MARK_SVG,
  THEME_ICON_LIGHT,
  THEME_ICON_SYSTEM,
  THEME_ICON_DARK,
  INFO_ICON,
} from "./icons.js";

const THEME_STORAGE_KEY = "coinpeas-theme";

const els = {};

function renderShell() {
  return `
    <div class="page">
      <header class="site-header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">${BRAND_MARK_SVG}</span>
          <span class="brand-name">CoinPeas</span>
        </div>

        <div class="header-actions">
          <div class="theme-toggle" role="group" aria-label="Theme">
            <button type="button" class="theme-btn" data-theme-choice="light" aria-label="Light theme" title="Light">
              ${THEME_ICON_LIGHT}
            </button>
            <button type="button" class="theme-btn" data-theme-choice="system" aria-label="Match system theme" title="System">
              ${THEME_ICON_SYSTEM}
            </button>
            <button type="button" class="theme-btn" data-theme-choice="dark" aria-label="Dark theme" title="Dark">
              ${THEME_ICON_DARK}
            </button>
          </div>
        </div>
      </header>

      <main class="content">
        <section class="intro">
          <h1>Top 100 coins by market cap</h1>
          <p>Efficient, as far as is possible and practicable.</p>
        </section>

        <div id="list-meta" class="list-meta" hidden>
          <div class="updated-row">
            <span id="updated-at" class="updated-at"></span>
            <button
              id="updated-info-btn"
              class="info-btn"
              type="button"
              aria-expanded="false"
              aria-controls="updated-info-popover"
              aria-label="Refresh schedule info"
            >
              ${INFO_ICON}
            </button>
            <div id="updated-info-popover" class="info-popover" role="tooltip" hidden>
              Data updates every hour, on the hour. Reload the page to see the latest.
            </div>
          </div>
        </div>

        <section id="panel" class="panel" aria-live="polite" hidden>
          <div id="error-state" class="state-block" hidden>
            <p>We couldn't reach the market data right now.</p>
            <button class="retry-btn retry-btn-inline" type="button" data-retry>Try again</button>
          </div>

          <div id="table-wrapper" class="table-wrapper" hidden>
            <table class="coin-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-coin">Coin</th>
                  <th class="col-price">Price</th>
                  <th class="col-change">24h</th>
                  <th class="col-marketcap">Market Cap</th>
                  <th class="col-volume">24h Volume</th>
                </tr>
              </thead>
              <tbody id="coin-rows"></tbody>
            </table>
          </div>
        </section>

        <footer id="site-footer" class="site-footer" hidden>
          <a class="attribution" href="https://www.coingecko.com/en/api/" target="_blank" rel="noopener">Powered by CoinGecko API</a>
          <p>
            Not financial advice. Do your own research —
            CoinPeas isn't liable for how you use this data.<br />
            <span class="footer-mark">
              ${BRAND_MARK_SVG}
              <span class="footer-mark-text" id="footer-host"></span>
            </span>
            <br />
            Give peas a chance. A <a class="footer-link" href="https://github.com/peaspls" target="_blank" rel="noopener">peaspls</a> project · <a class="footer-link" href="https://github.com/peaspls/coinpeas-static" target="_blank" rel="noopener">View source on GitHub</a>
          </p>
        </footer>
      </main>
    </div>`;
}

const ELEMENT_IDS = {
  panel: "panel",
  error: "error-state",
  listMeta: "list-meta",
  tableWrapper: "table-wrapper",
  rows: "coin-rows",
  updatedAt: "updated-at",
  updatedInfoBtn: "updated-info-btn",
  updatedInfoPopover: "updated-info-popover",
  footer: "site-footer",
  footerHost: "footer-host",
};

function queryEls() {
  for (const [key, id] of Object.entries(ELEMENT_IDS)) {
    els[key] = document.getElementById(id);
  }
  els.themeBtns = document.querySelectorAll(".theme-btn");
}

// ---------- Theme ----------

const root = document.documentElement;
const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(pref) {
  root.setAttribute("data-theme-pref", pref);
  if (pref === "system") {
    root.setAttribute("data-theme", darkSchemeQuery.matches ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", pref);
  }
  els.themeBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeChoice === pref);
  });
}

function initTheme() {
  let pref = "system";
  try {
    pref = localStorage.getItem(THEME_STORAGE_KEY) || "system";
  } catch (e) {
    /* localStorage unavailable; fall back to system */
  }
  applyTheme(pref);

  els.themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.themeChoice;
      applyTheme(choice);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, choice);
      } catch (e) {
        /* ignore persistence failures (private browsing, etc.) */
      }
    });
  });

  darkSchemeQuery.addEventListener("change", () => {
    if (root.getAttribute("data-theme-pref") === "system") applyTheme("system");
  });
}

// ---------- Formatting ----------

const PLACEHOLDER = "—";

// Sub-$1 coins (many meme/small-cap coins) need more than 2 decimal places
// to show a non-zero price at all, so that case gets its own formatter.
const usdSubDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

const usdStandard = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function formatPrice(value) {
  if (value == null) return PLACEHOLDER;
  return value < 1 ? usdSubDollar.format(value) : usdStandard.format(value);
}

function formatCompactUSD(value) {
  if (value == null) return PLACEHOLDER;
  return usdCompact.format(value);
}

function formatChange(value) {
  if (value == null) return PLACEHOLDER;
  const sign = value > 0 ? "+" : "";
  return sign + value.toFixed(2) + "%";
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const HTML_ESCAPE_RE = /[&<>"']/g;

function escapeHTML(str) {
  return String(str).replace(HTML_ESCAPE_RE, (c) => HTML_ESCAPES[c]);
}

// ---------- Rendering ----------

// coins.json stores columns (one array per field) rather than one object
// per coin, so field names aren't repeated 100 times over — reassemble
// rows here, where it only costs a lookup per coin per page load rather
// than a repeated field name per coin in the transferred file.
function toCoinObjects(columns) {
  const fields = Object.keys(columns);
  const count = columns[fields[0]]?.length ?? 0;
  const rows = new Array(count);
  for (let i = 0; i < count; i++) {
    const row = {};
    for (const field of fields) row[field] = columns[field][i];
    rows[i] = row;
  }
  return rows;
}

function renderRows(coins) {
  const html = coins.map((coin) => {
    const change = coin.price_change_percentage_24h;
    const changeClass = change > 0 ? "change-positive" : change < 0 ? "change-negative" : "";
    const name = escapeHTML(coin.name);
    const symbol = escapeHTML(coin.symbol);
    return `
      <tr>
        <td class="col-rank">${coin.market_cap_rank ?? PLACEHOLDER}</td>
        <td class="col-coin">
          <div class="coin-cell">
            <span class="coin-label">
              <span class="coin-name" title="${name}">${name}</span>
              <span class="coin-symbol" title="${symbol}">${symbol}</span>
            </span>
          </div>
        </td>
        <td class="col-price">${formatPrice(coin.current_price)}</td>
        <td class="col-change ${changeClass}">${formatChange(change)}</td>
        <td class="col-marketcap">${formatCompactUSD(coin.market_cap)}</td>
        <td class="col-volume">${formatCompactUSD(coin.total_volume)}</td>
      </tr>`;
  }).join("");

  els.rows.innerHTML = html;
}

// The panel and footer stay out of the layout entirely until the data
// request settles, then appear already in their final state — revealing an
// element that was never rendered before doesn't count as a layout shift,
// where swapping a visible loading skeleton for the real content would.
function setViewState(state) {
  els.panel.hidden = false;
  els.footer.hidden = false;
  els.error.hidden = state !== "error";
  els.listMeta.hidden = state !== "table";
  els.tableWrapper.hidden = state !== "table";
}

function updateCacheMeta(data) {
  if (!data || !data.generated_at) {
    els.updatedAt.textContent = "";
    return;
  }
  const date = new Date(data.generated_at);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const formatted = date.toLocaleString("en-US", {
    ...(isToday ? {} : { month: "short", day: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  els.updatedAt.textContent = "Updated " + formatted;
}

// ---------- Data loading ----------
// coins.json is refreshed by a build-time script (see scripts/fetch-coins.mjs)
// and inlined into index.html as window.__COINS__ by vite.config.js's
// transformIndexHtml plugin, so it's already on the page by the time this
// runs — no import, fetch, or cache-control dance needed.

function loadCoins() {
  try {
    const data = window.__COINS__;
    // A columnar coins.json always has a "name" column; checking for it
    // also confirms `data.coins` itself is present and the right shape.
    if (!Array.isArray(data?.coins?.name)) {
      throw new Error("Invalid coins.json");
    }
    renderRows(toCoinObjects(data.coins));
    updateCacheMeta(data);
    setViewState("table");
  } catch (err) {
    console.error("CoinPeas: failed to load coins", err);
    setViewState("error");
  }
}

function initRetry() {
  document.querySelectorAll("[data-retry]").forEach((btn) => {
    btn.addEventListener("click", loadCoins);
  });
}

// ---------- Updated-info popover ----------

function setInfoPopoverOpen(open) {
  els.updatedInfoBtn.setAttribute("aria-expanded", String(open));
  els.updatedInfoPopover.hidden = !open;
}

function initInfoPopover() {
  els.updatedInfoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setInfoPopoverOpen(els.updatedInfoPopover.hidden);
  });

  document.addEventListener("click", (e) => {
    if (
      !els.updatedInfoPopover.hidden &&
      !els.updatedInfoBtn.contains(e.target) &&
      !els.updatedInfoPopover.contains(e.target)
    ) {
      setInfoPopoverOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.updatedInfoPopover.hidden) {
      setInfoPopoverOpen(false);
      els.updatedInfoBtn.focus();
    }
  });
}

function init() {
  document.getElementById("app").innerHTML = renderShell();
  queryEls();

  initTheme();
  initRetry();
  initInfoPopover();
  els.footerHost.textContent = window.location.hostname;
  loadCoins();
}

// A module script is deferred by the platform (runs after the document is
// parsed), so the DOM is already ready by the time this executes — no
// DOMContentLoaded listener needed.
init();

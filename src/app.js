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
  FOOTER_SCENE_SVG,
  FOOTER_MOUND_SVG,
  FOOTER_SKY_SVG,
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
          <h1>Top 50 coins by market cap</h1>
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
              <strong class="info-title">Next update around <span id="next-update"></span></strong>
              Fresh prices arrive about every three hours. Reload then to see them.
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
                  <th class="col-coin">Coin<span class="stacked-price"> · Price · 24h</span></th>
                  <th class="col-price">Price<span class="stacked-change"> · 24h</span></th>
                  <th class="col-change">24h</th>
                  <th class="col-marketcap">Market Cap</th>
                </tr>
              </thead>
              <tbody id="coin-rows"></tbody>
            </table>
          </div>
        </section>

        <div id="list-source" class="list-source" hidden>
          <a class="attribution" href="https://www.coingecko.com/en/api/" target="_blank" rel="noopener">Powered by CoinGecko API</a>
        </div>
      </main>
    </div>

    <footer id="site-footer" class="site-footer" hidden>
      ${FOOTER_SKY_SVG}
      ${FOOTER_MOUND_SVG}
      ${FOOTER_SCENE_SVG}
      <p>
        Not financial advice. CoinPeas isn't liable for how you use this data.
      </p>
      <p class="footer-tagline">
        <span class="footer-mark" aria-hidden="true">${BRAND_MARK_SVG}</span>
        Give peas a chance. A <a class="footer-link" href="https://github.com/peaspls" target="_blank" rel="noopener">peaspls</a> project · <a class="footer-link" href="https://github.com/peaspls/coinpeas-static" target="_blank" rel="noopener">View source on GitHub</a>
      </p>
      <p class="footer-hint">Follow the white rabbit.</p>
    </footer>`;
}

const ELEMENT_IDS = {
  panel: "panel",
  error: "error-state",
  listMeta: "list-meta",
  listSource: "list-source",
  tableWrapper: "table-wrapper",
  rows: "coin-rows",
  updatedAt: "updated-at",
  updatedInfoBtn: "updated-info-btn",
  updatedInfoPopover: "updated-info-popover",
  nextUpdate: "next-update",
  footer: "site-footer",
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

function chooseTheme(choice) {
  applyTheme(choice);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch (e) {
    /* ignore persistence failures (private browsing, etc.) */
  }
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
    btn.addEventListener("click", () => chooseTheme(btn.dataset.themeChoice));
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

// Falls use a true minus sign (−), which is as wide as the plus and easier
// to tell from it than a hyphen.
function formatChange(value) {
  if (value == null) return PLACEHOLDER;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return sign + Math.abs(value).toFixed(2) + "%";
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const HTML_ESCAPE_RE = /[&<>"']/g;

function escapeHTML(str) {
  return String(str).replace(HTML_ESCAPE_RE, (c) => HTML_ESCAPES[c]);
}

// ---------- Rendering ----------

// The coin data comes as columns (one array per field) rather than one
// object per coin, so reassemble it into one object per row.
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
              <span class="stacked-price">${formatPrice(coin.current_price)} <span class="${changeClass}">${formatChange(change)}</span></span>
            </span>
          </div>
        </td>
        <td class="col-price">${formatPrice(coin.current_price)}<span class="stacked-change ${changeClass}">${formatChange(change)}</span></td>
        <td class="col-change ${changeClass}">${formatChange(change)}</td>
        <td class="col-marketcap">${formatCompactUSD(coin.market_cap)}</td>
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
  els.listSource.hidden = state !== "table";
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
// The coin data is already on the page as window.__COINS__ by the time this
// runs, so there's nothing to fetch.

function loadCoins() {
  try {
    const data = window.__COINS__;
    // The columnar data always has a "name" column; checking for it also
    // confirms `data.coins` itself is present and the right shape.
    if (!Array.isArray(data?.coins?.name)) {
      throw new Error("Invalid coin data");
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

// The data updates every three hours at ten past the hour (UTC): 00:10,
// 03:10, 06:10, … Returns the first of those after `now`.
function nextUpdateAfter(now) {
  const next = new Date(now);
  next.setUTCHours(next.getUTCHours() - (next.getUTCHours() % 3), 10, 0, 0);
  while (next <= now) next.setUTCHours(next.getUTCHours() + 3);
  return next;
}

function setInfoPopoverOpen(open) {
  if (open) {
    els.nextUpdate.textContent = nextUpdateAfter(new Date()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
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

// ---------- Footer scene ----------
// Clicking the sun brings the night (dark theme) and the moon brings the day
// (light theme), like the theme buttons; clicking the tree moves on to the
// next season until the page is reloaded.

const SEASONS = ["spring", "summer", "autumn", "winter"];

function initFooterScene() {
  els.footer.querySelector(".sun").addEventListener("click", () => chooseTheme("dark"));
  els.footer.querySelector(".moon").addEventListener("click", () => chooseTheme("light"));
  els.footer.querySelector(".footer-tree").addEventListener("click", () => {
    const current = SEASONS.indexOf(root.getAttribute("data-season"));
    root.setAttribute("data-season", SEASONS[(current + 1) % SEASONS.length]);
  });
}

function init() {
  document.getElementById("app").innerHTML = renderShell();
  queryEls();

  initTheme();
  initRetry();
  initInfoPopover();
  initFooterScene();
  loadCoins();
}

// A module script is deferred by the platform (runs after the document is
// parsed), so the DOM is already ready by the time this executes — no
// DOMContentLoaded listener needed.
init();

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
    </footer>`;
}

const ELEMENT_IDS = {
  panel: "panel",
  error: "error-state",
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

function changeClassOf(change) {
  return change > 0 ? "change-positive" : change < 0 ? "change-negative" : "";
}

function renderRows(coins) {
  const html = coins.map((coin, i) => {
    const change = coin.price_change_percentage_24h;
    const changeClass = changeClassOf(change);
    const name = escapeHTML(coin.name);
    const symbol = escapeHTML(coin.symbol);
    return `
      <tr class="coin-row" data-index="${i}">
        <td class="col-rank">${coin.market_cap_rank ?? PLACEHOLDER}</td>
        <td class="col-coin">
          <div class="coin-cell">
            <span class="coin-label">
              <button type="button" class="coin-toggle" aria-expanded="false" aria-controls="coin-details-${i}">
                <span class="coin-name" title="${name}">${name}</span>
                <span class="coin-symbol" title="${symbol}">${symbol}</span>
              </button>
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
    dataTime = Date.parse(data.generated_at);
    detailsCache.clear();
    renderRows(toCoinObjects(data.coins));
    updateCacheMeta(data);
    setViewState("table");
  } catch (err) {
    console.error("CoinPeas: failed to load coins", err);
    setViewState("error");
  }
}

// ---------- Coin details ----------
// Clicking a coin's row (or its name button, from the keyboard) opens a
// details row under it. Its details are fetched the first time it opens,
// from coins/<generated_at in ms>/<position in the list>.json, as an array
// in the order of the destructuring in renderDetails.

// When the data was fetched, in ms; also the name of its details folder.
let dataTime = 0;
const detailsCache = new Map();

function changeHTML(value) {
  return `<span class="${changeClassOf(value)}">${formatChange(value)}</span>`;
}

// The sparkline has one price every 4 hours, the last one at the data's
// generated_at time.
const SPARKLINE_STEP_MS = 4 * 60 * 60 * 1000;
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short" });
const pointTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// A day's label under the chart, centred at x%: its date, or the month's
// name on the first of a month, e.g. "30", "Dec", "2".
function dayLabel(time, x) {
  const day = new Date(time);
  return day.getDate() === 1
    ? `<span class="chart-month" style="left:${x}%">${monthFormat.format(day)}</span>`
    : `<span style="left:${x}%">${day.getDate()}</span>`;
}

// The day boundaries (local midnights) between two times.
function midnightsBetween(start, end) {
  const midnights = [];
  const day = new Date(start);
  day.setHours(24, 0, 0, 0);
  for (; day.getTime() < end; day.setDate(day.getDate() + 1)) midnights.push(day.getTime());
  return midnights;
}

// About three round price levels (1, 2, 2.5 or 5 times a power of ten
// apart) between min and max, with a formatter that shows just enough
// decimals for them.
function priceTicks(min, max) {
  const rough = (max - min) / 3 || max || 1;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough);
  const ticks = [];
  for (let k = Math.ceil(min / step); k * step <= max; k++) ticks.push(k * step);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + (step / power === 2.5 ? 1 : 0));
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return ticks.map((tick) => [tick, format.format(tick)]);
}

// Where each price sits in the chart, from the top, in percent: the
// highest at 8, the lowest at 92.
function chartScale(prices) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  return { min, max, y: (price) => 92 - ((price - min) / range) * 84 };
}

// A price chart: the line over a soft fill, in red or green as the price
// fell or rose over the 7 days, with that change beside its label, round
// price levels on the right, the latest price marked on that axis and the
// date under each day. Hovering (or dragging a finger along) it shows the
// time and price at that point. It's an image whose label says in words
// what the line shows; the text around it repeats that, so it's hidden
// from screen readers.
function chartHTML(prices, change, endTime, index) {
  if (prices.length < 2) return "";
  const { min, max, y } = chartScale(prices);
  const startTime = endTime - (prices.length - 1) * SPARKLINE_STEP_MS;
  const x = (time) => ((time - startTime) / (endTime - startTime)) * 100;
  const last = prices.at(-1);

  const line = prices.map((price, i) => `${x(startTime + i * SPARKLINE_STEP_MS).toFixed(1)},${y(price).toFixed(1)}`).join(" ");
  const midnights = midnightsBetween(startTime, endTime);
  const ticks = priceTicks(min, max);

  // Price levels too close to the latest price's label are left out, so
  // the two never overlap.
  const tickLabels = ticks
    .filter(([tick]) => Math.abs(y(tick) - y(last)) > 12)
    .map(([tick, text]) => `<span style="top:${y(tick)}%">${text}</span>`)
    .join("");

  // Each day's label centred under its part of the line, skipping the part
  // days at either end that are too narrow to hold one.
  const bounds = [startTime, ...midnights, endTime];
  const dayLabels = bounds
    .slice(0, -1)
    .map((dayStart, i) => [dayStart, bounds[i + 1]])
    .filter(([from, to]) => (to - from) / (endTime - startTime) > 0.09)
    .map(([from, to]) => dayLabel(from, x((from + to) / 2)))
    .join("");

  const label =
    `Price over the last 7 days, from ${formatPrice(prices[0])} to ${formatPrice(last)}, ` +
    `highest ${formatPrice(max)}, lowest ${formatPrice(min)}`;
  return `
    <figure class="chart">
      <figcaption>Last 7 days ${changeHTML(change)}</figcaption>
      <div class="chart-body">
        <div class="chart-plot ${changeClassOf(change)}" data-index="${index}">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="${label}">
            <defs>
              <linearGradient id="chart-fill-${index}" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stop-color="currentColor" stop-opacity=".16"/>
                <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon points="0,100 ${line} 100,100" fill="url(#chart-fill-${index})"/>
            <polyline points="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
          </svg>
          <div class="chart-cursor" hidden aria-hidden="true">
            <span class="chart-dot"></span>
            <span class="chart-tip"><span class="chart-tip-price"></span><span class="chart-tip-time"></span></span>
          </div>
        </div>
        <div class="chart-axis" aria-hidden="true">
          ${tickLabels}
          <span class="chart-axis-last" style="top:${y(last)}%">${formatPrice(last)}</span>
          <span class="chart-axis-sizer">${formatPrice(max)}</span>
        </div>
        <div class="chart-days" aria-hidden="true">${dayLabels}</div>
      </div>
    </figure>`;
}

// Moves the crosshair to the point nearest the pointer, with that point's
// price and time in a box beside it. The box sits above and to the right
// of the point, and goes to the left near the right edge and below near
// the top, so it stays inside the chart.
function showChartPoint(plot, clientX) {
  const prices = detailsCache.get(Number(plot.dataset.index))?.at(-1);
  if (!prices) return;
  const box = plot.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
  const i = Math.round(fraction * (prices.length - 1));
  const time = dataTime - (prices.length - 1 - i) * SPARKLINE_STEP_MS;
  const x = i / (prices.length - 1);
  const y = chartScale(prices).y(prices[i]);
  const cursor = plot.querySelector(".chart-cursor");
  const [dot, tip] = cursor.children;
  cursor.hidden = false;
  cursor.style.left = `${x * 100}%`;
  dot.style.top = tip.style.top = `${y}%`;
  tip.classList.toggle("is-left", x > 0.6);
  tip.classList.toggle("is-below", y < 40);
  tip.firstElementChild.textContent = formatPrice(prices[i]);
  tip.lastElementChild.textContent = pointTimeFormat.format(time);
}

function hideChartPoint(plot) {
  plot.querySelector(".chart-cursor").hidden = true;
}

function renderDetails(details, index) {
  const [change7d, sparkline] = details;
  return `<div class="coin-details">${chartHTML(sparkline, change7d, dataTime, index)}</div>`;
}

async function fetchDetails(index) {
  if (detailsCache.has(index)) return detailsCache.get(index);
  const response = await fetch(`/coins/${dataTime}/${index}.json`);
  if (!response.ok) throw new Error(response.status === 404 ? "outdated" : `HTTP ${response.status}`);
  const details = await response.json();
  detailsCache.set(index, details);
  return details;
}

async function toggleCoin(row) {
  const index = Number(row.dataset.index);
  const button = row.querySelector(".coin-toggle");
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));

  let detailsRow = document.getElementById(`coin-details-${index}`);
  if (!open) {
    detailsRow.hidden = true;
    return;
  }
  if (!detailsRow) {
    detailsRow = document.createElement("tr");
    detailsRow.id = `coin-details-${index}`;
    detailsRow.className = "details-row";
    detailsRow.innerHTML = '<td colspan="5"></td>';
    row.after(detailsRow);
  }
  detailsRow.hidden = false;

  const cell = detailsRow.firstElementChild;
  if (!detailsCache.has(index)) cell.innerHTML = '<p class="details-note">Loading details…</p>';
  try {
    cell.innerHTML = renderDetails(await fetchDetails(index), index);
  } catch (err) {
    console.error("CoinPeas: failed to load coin details", err);
    cell.innerHTML =
      err.message === "outdated"
        ? '<p class="details-note">The list has been updated since this page was loaded. Reload the page to see the latest.</p>'
        : '<p class="details-note">We couldn\'t load the details right now. Close and open the coin to try again.</p>';
  }
}

function initCoinDetails() {
  els.rows.addEventListener("click", (e) => {
    const row = e.target.closest(".coin-row");
    if (row) toggleCoin(row);
  });
  els.rows.addEventListener("pointermove", (e) => {
    const plot = e.target.closest(".chart-plot");
    if (plot) showChartPoint(plot, e.clientX);
  });
  els.rows.addEventListener("pointerout", (e) => {
    const plot = e.target.closest(".chart-plot");
    if (plot && !plot.contains(e.relatedTarget)) hideChartPoint(plot);
  });
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
  initCoinDetails();
  initInfoPopover();
  initFooterScene();
  loadCoins();
}

// A module script is deferred by the platform (runs after the document is
// parsed), so the DOM is already ready by the time this executes — no
// DOMContentLoaded listener needed.
init();

// CoinPeas frontend: plain JS, no build step, no framework.
(function () {
  "use strict";

  const THEME_STORAGE_KEY = "coinpeas-theme";

  const els = {};

  // ---------- Shell ----------
  //
  // The entire page body is rendered here rather than living in index.html,
  // so the only markup shipped to the browser up front is the bare minimum
  // needed to avoid a theme flash (see the inline script in index.html's
  // <head>) — everything else is app.js's responsibility.

  const BRAND_MARK_SVG = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 16.7c1.2-6.4 6.8-9.4 20-9.4 -1.2 6.4-6.8 9.4-20 9.4Z" fill="currentColor" opacity="0.15"/>
      <path d="M2 16.7c1.2-6.4 6.8-9.4 20-9.4 -1.2 6.4-6.8 9.4-20 9.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="7.6" cy="15.3" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="13.6" r="1.5" fill="currentColor"/>
      <circle cx="16.4" cy="11.9" r="1.5" fill="currentColor"/>
    </svg>`;

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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="theme-btn" data-theme-choice="system" aria-label="Match system theme" title="System">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="12" rx="1.6" stroke="currentColor" stroke-width="1.6"/><path d="M8 20h8M12 16.5V20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="theme-btn" data-theme-choice="dark" aria-label="Dark theme" title="Dark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a7 7 0 0 0 10.3 10.3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </header>

        <main class="content">
          <section class="intro">
            <h1>A view of the crypto market</h1>
            <p>Top 100 crypto coins, ranked by market cap.</p>
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
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                  <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"></circle>
                  <line x1="8" y1="7" x2="8" y2="11.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></line>
                  <circle cx="8" cy="4.6" r="0.9" fill="currentColor"></circle>
                </svg>
              </button>
              <div id="updated-info-popover" class="info-popover" role="tooltip" hidden>
                Refreshes on the hour and every 15 min after.
              </div>
            </div>
          </div>

          <section class="panel" aria-live="polite">
            <div id="loading-state" class="state-block">
              <div class="pea-spinner" aria-hidden="true"></div>
              <p>Growing your dashboard&hellip;</p>
            </div>

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

          <footer class="site-footer">
            <a class="attribution" href="https://www.coingecko.com/en/api/" target="_blank" rel="noopener">Powered by CoinGecko API</a>
            <p>
              <span class="footer-mark">
                ${BRAND_MARK_SVG}
                <span class="footer-mark-text" id="footer-host"></span>
              </span>
              <br />
              For informational purposes only.<br />
              By peaspls, for every creature that shares this world — <a class="footer-link" href="https://github.com/peaspls/coinpeas-static" target="_blank" rel="noopener">view source on GitHub</a>.
            </p>
          </footer>
        </main>
      </div>`;
  }

  function queryEls() {
    els.loading = document.getElementById("loading-state");
    els.error = document.getElementById("error-state");
    els.listMeta = document.getElementById("list-meta");
    els.tableWrapper = document.getElementById("table-wrapper");
    els.rows = document.getElementById("coin-rows");
    els.updatedAt = document.getElementById("updated-at");
    els.updatedInfoBtn = document.getElementById("updated-info-btn");
    els.updatedInfoPopover = document.getElementById("updated-info-popover");
    els.footerHost = document.getElementById("footer-host");
  }

  // ---------- Theme ----------

  function applyTheme(pref) {
    const root = document.documentElement;
    root.setAttribute("data-theme-pref", pref);
    if (pref === "system") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", dark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", pref);
    }
    document.querySelectorAll(".theme-btn").forEach((btn) => {
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

    document.querySelectorAll(".theme-btn").forEach((btn) => {
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

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const current = document.documentElement.getAttribute("data-theme-pref");
      if (current === "system") applyTheme("system");
    });
  }

  // ---------- Formatting ----------

  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  const usdCompact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  });

  function formatPrice(value) {
    if (value === null || value === undefined) return "—";
    if (value < 1) {
      return usd.format(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatCompactUSD(value) {
    if (value === null || value === undefined) return "—";
    return usdCompact.format(value);
  }

  function formatChange(value) {
    if (value === null || value === undefined) return "—";
    const sign = value > 0 ? "+" : "";
    return sign + value.toFixed(2) + "%";
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
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
      const changeClass =
        coin.price_change_percentage_24h > 0
          ? "change-positive"
          : coin.price_change_percentage_24h < 0
          ? "change-negative"
          : "";
      const initial = escapeHTML((coin.name || coin.symbol || "?").trim().charAt(0).toUpperCase());
      const avatar = `<span class="coin-avatar" aria-hidden="true">${initial}</span>`;

      return `
        <tr>
          <td class="col-rank">${coin.market_cap_rank ?? "—"}</td>
          <td class="col-coin">
            <div class="coin-cell">
              ${avatar}
              <span class="coin-label">
                <span class="coin-name" title="${escapeHTML(coin.name)}">${escapeHTML(coin.name)}</span>
                <span class="coin-symbol" title="${escapeHTML(coin.symbol)}">${escapeHTML(coin.symbol)}</span>
              </span>
            </div>
          </td>
          <td class="col-price">${formatPrice(coin.current_price)}</td>
          <td class="col-change ${changeClass}">${formatChange(coin.price_change_percentage_24h)}</td>
          <td class="col-marketcap">${formatCompactUSD(coin.market_cap)}</td>
          <td class="col-volume">${formatCompactUSD(coin.total_volume)}</td>
        </tr>`;
    }).join("");

    els.rows.innerHTML = html;
  }

  function showLoading() {
    els.loading.hidden = false;
    els.error.hidden = true;
    els.listMeta.hidden = true;
    els.tableWrapper.hidden = true;
  }

  function showError() {
    els.loading.hidden = true;
    els.error.hidden = false;
    els.listMeta.hidden = true;
    els.tableWrapper.hidden = true;
  }

  function showTable() {
    els.loading.hidden = true;
    els.error.hidden = true;
    els.listMeta.hidden = false;
    els.tableWrapper.hidden = false;
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
    const formatted = isToday
      ? date.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
    els.updatedAt.textContent = "Updated " + formatted;
  }

  // ---------- Data loading ----------
  //
  // coins.json is refreshed by a build-time script and rebuilt into its own
  // hashed chunk on every data refresh (see scripts/fetch-coins.mjs), so a
  // dynamic import always resolves to whatever was current at build time —
  // no runtime fetch or cache-control dance needed.

  async function loadCoins() {
    showLoading();

    try {
      const { default: data } = await import("./coins.json");
      if (typeof data?.coins !== "object" || !Array.isArray(data?.coins?.name)) {
        throw new Error("Invalid coins.json");
      }
      renderRows(toCoinObjects(data.coins));
      updateCacheMeta(data);
      showTable();
    } catch (err) {
      console.error("CoinPeas: failed to load coins", err);
      showError();
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

  document.addEventListener("DOMContentLoaded", init);
})();

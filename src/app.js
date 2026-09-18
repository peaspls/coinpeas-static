// CoinPeas frontend: plain JS, no build step, no framework.
(function () {
  "use strict";

  const COINS_URL = "/coins.json";
  const THEME_STORAGE_KEY = "coinpeas-theme";

  const els = {
    loading: document.getElementById("loading-state"),
    error: document.getElementById("error-state"),
    listMeta: document.getElementById("list-meta"),
    tableWrapper: document.getElementById("table-wrapper"),
    rows: document.getElementById("coin-rows"),
    updatedAt: document.getElementById("updated-at"),
    footerHost: document.getElementById("footer-host"),
  };

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
    const formatted = date.toLocaleString("en-US", {
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
  // coins.json is a static file refreshed periodically by a build-time
  // script, not a live API, so this only fetches once per page load.
  // no-cache forces a revalidation request (cheap 304 if unchanged) instead
  // of trusting the browser's cached copy for the full Cache-Control max-age.

  async function loadCoins() {
    showLoading();

    try {
      const response = await fetch(COINS_URL, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const data = await response.json();
      if (!Array.isArray(data?.coins)) {
        throw new Error("Invalid coins.json");
      }
      renderRows(data.coins);
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

  function init() {
    initTheme();
    initRetry();
    els.footerHost.textContent = window.location.hostname;
    loadCoins();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

// Inline SVGs for the app shell (src/app.js) — inherit currentColor so they recolor with the theme.

export const BRAND_MARK_SVG = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 16.7c1.2-6.4 6.8-9.4 20-9.4 -1.2 6.4-6.8 9.4-20 9.4Z" fill="currentColor" opacity="0.15"/>
    <path d="M2 16.7c1.2-6.4 6.8-9.4 20-9.4 -1.2 6.4-6.8 9.4-20 9.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="7.6" cy="15.3" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="13.6" r="1.5" fill="currentColor"/>
    <circle cx="16.4" cy="11.9" r="1.5" fill="currentColor"/>
  </svg>`;

export const THEME_ICON_LIGHT = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/>
    <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;

export const THEME_ICON_SYSTEM = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4.5" width="18" height="12" rx="1.6" stroke="currentColor" stroke-width="1.6"/>
    <path d="M8 20h8M12 16.5V20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;

export const THEME_ICON_DARK = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a7 7 0 0 0 10.3 10.3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`;

export const INFO_ICON = `
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"></circle>
    <line x1="8" y1="7" x2="8" y2="11.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></line>
    <circle cx="8" cy="4.6" r="0.9" fill="currentColor"></circle>
  </svg>`;

// Decorative footer band: a quiet meadow — grass, sprouts and flowers, with a
// cat sitting, a rabbit resting, a bird perched on a stem and a fish leaping
// from a little pond. To keep it small, the whole scene is two paths: soft
// filled shapes and plain lines (dots are zero-length lines with round caps).
// Coordinates are relative; each part starts with an absolute M so parts can
// be moved or removed independently.
const MEADOW_SOFT =
  // plants
  "M336 52c-2-3-6-3-7-1 2 2 5 2 7 1zm0-2c2-3 6-3 7-1-2 2-5 2-7 1zM668 50c-2-3-6-3-7-1 2 2 5 2 7 1zm0-2c2-3 6-3 7-1-2 2-5 2-7 1zM417.5 44.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M622.5 43.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" +
  // pond
  "M505 57c7 8.5 43 8.5 50 0" +
  // cat
  "M380 43.5c-6 1.5-7 8.5-5.5 13.5h19c1.5-5 .5-12-5.5-13.5zM377.5 38.5c0-3 .5-5.5 1.5-8l3.5 2.5c1-.2 2-.2 3 0l3.5-2.5c1 2.5 1.5 5 1.5 8 0 3.5-3 5.7-6.5 5.7-3.5 0-6.5-2.2-6.5-5.7z" +
  // rabbit
  "M494 57c4-6 0-12-9-12-7 0-12 1-15 2-2-4-10-4-11 1-1 4 3 7 7 7l1 2zM468 45c3-5 9-7 12-6-3 3-7 5-11 7zm-2-1c1-6 6-9 9-9-2 4-5 7-8 10z" +
  // fish
  "M524.5 51.8c1-4.9 6.9-8.8 11.8-7.7-2.4 4.4-8.3 8.3-11.8 7.7zm0 0-4.9-1 3.2 4.6z" +
  // bird
  "M579 25c2-4 9-4 10 1 5 3 11 6 17 5l-4 4c-4 5-18 6-22-1-2-3-2-6-1-9z";

const MEADOW_LINES =
  // plants
  "M300 58l-3-7m5 7v-9m2 9 3-6M440 57l-3-7m5 7v-9m2 9 3-6M336 58v-8M668 56v-8M420 57c1-4-1-7 0-10M420 44.5h0M625 56c1-4-1-7 0-10M625 43.5h0" +
  // ground
  "M270 57c80-2 130 2 220 0 90-2 140-2 220 0" +
  // pond
  "M515 60.5h7m11 1.5h9m-17 1.5h5" +
  // cat
  "M380.3 38.4q1.2-1.1 2.4 0m2.6 0q1.2-1.1 2.4 0m-4.7 2.9q.5.6 1 0 .5.6 1 0m8.5 14.7c6 1 9-4 6-8m-18.5 9v-3m6 3v-3M384 40.3h0" +
  // rabbit
  "M494 53a2 2 0 1 0 4 0 2 2 0 1 0-4 0M463 48h0" +
  // fish
  "M533.2 45.5h0M519 53h0M542 52h0M545 55h0" +
  // bird
  "M591 57c1-6-1-11-3-15m2 7c3-2 6-2 8 0-3 2-6 2-8 0zM579 25l-5 2 5 1.5m15 2.5c-4 3-8 3-10 1m6 7v3m-4-3v3M583 25.5h0";

export const FOOTER_VINE_SVG = `<svg class="footer-vine" viewBox="270 12 440 56" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MEADOW_SOFT}" fill="currentColor" fill-opacity=".15"/><path d="${MEADOW_LINES}"/></svg>`;

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

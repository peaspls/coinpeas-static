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

// Decorative footer scene, standing on the crest of the footer's hill: a
// tree of life at the centre with a bird on one of its branches, a rabbit
// resting to its left and a cat sitting to its right, among a tuft of grass
// and a sprout. Drawn in lines with a soft fill, like a quiet sketch; only the
// leaves take colour (.leaves, .leaves-alt). The animals have awake (.awake) and
// asleep (.asleep) poses, for the stylesheet to choose between.

// Winter's extra (.winter-only): a bird feeder hanging from a branch.
const FEEDER =
  `<g class="feeder"><path d="M138.5 66.4v3.3M131.6 74.4L138.5 69l6.9 5.4M134.6 85.2h-2.6"/>` +
  `<path class="feeder-house" d="M133.6 74v8.4h9.8V74"/><circle cx="138.5" cy="78.2" r="1.6"/></g>`;


// The sky, around the tree. By day a sun in a warm tint (.sun); at night, in
// its place, a crescent moon (.moon), stars, and two that twinkle in turn.
const SUN_DISC = "M283 20a5 5 0 1 0 10 0 5 5 0 1 0-10 0";
const SUN_RAYS = "M295.5 20l2.5 0M293.3 25.3l1.8 1.8M288 27.5l0 2.5M282.7 25.3l-1.8 1.8M280.5 20l-2.5 0M282.7 14.7l-1.8 -1.8M288 12.5l0 -2.5M293.3 14.7l1.8 -1.8";
const MOON = "M286 13a8 8 0 1 0 8 12.5 6.5 6.5 0 1 1-8-12.5z";
const STARS = "M38 34h0M74 14h0M236 16h0M322 52h0M2 60h0M-40 22h0M-22 50h0M16 12h0M56 44h0M98 30h0M104 64h0M222 42h0M250 28h0M304 6h0M340 26h0M362 48h0M384 16h0M28 61h0M306 41h0M-73 31h0M201 9h0M35 7h0M395 57h0M373 31h0M-15 71h0M381 68h0M281 59h0M315 18h0M360 68h0M394 32h0";
const TWINKLES = ["M262 44v5m-2.5-2.5h5", "M60 18v4m-2-2h4"];

// Plants on the ground: a tuft of grass and a sprout, none in winter (.plants);
// summer adds more grass and a few flowers (.summer-plants). Tulips grow in
// spring (.spring-plants) and asters in autumn (.autumn-plants); summer shows
// them all.
const PLANTS_SOFT = "M203 107c-2-3-6-3-7-1 2 2 5 2 7 1zm0-2c2-3 6-3 7-1-2 2-5 2-7 1z";
const PLANTS_LINES = "M120 113l-3-7m5 7v-9m2 9 3-6M203 113v-8";
const SUMMER_SOFT = "M133.5 100.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M185.5 102.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M260.5 100.8a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0";
const SUMMER_LINES = "M136 113c1-4-1-7 0-10m0-2.5h0M188 113c1-3.2-1-5.6 0-8m0-2.5h0M263 113.3c1-4-1-7 0-10m0-2.5h0M174 113l-3-7m5 7v-9m2 9 3-6M57 113.2l-3-7m5 7v-9m2 9 3-6";
const SPRING_LINES = "M22 114c.5-4-.5-8 0-11M22 112.5c-3-2-4.5-5-3.5-8.5 2.2 2 3.5 5 3.5 8.5M144 113c.5-4-.5-8 0-11M144 111.5c-3-2-4.5-5-3.5-8.5 2.2 2 3.5 5 3.5 8.5M296 114c.5-4-.5-8 0-11M296 112.5c-3-2-4.5-5-3.5-8.5 2.2 2 3.5 5 3.5 8.5";
const TULIPS = "M19 98.5q0 4.5 3 4.5q3 0 3-4.5l-1.5 1.6-1.5-2.2-1.5 2.2zM141 97.5q0 4.5 3 4.5q3 0 3-4.5l-1.5 1.6-1.5-2.2-1.5 2.2zM293 98.5q0 4.5 3 4.5q3 0 3-4.5l-1.5 1.6-1.5-2.2-1.5 2.2z";
const AUTUMN_LINES = "M36 114c-1-4 1-7 0-10M128 113c-1-4 1-7 0-10M280 114c-1-4 1-7 0-10";
const ASTER_PETALS = "M37.6 101l2.2 0M37.13 102.13l1.56 1.56M36 102.6l0 2.2M34.87 102.13l-1.56 1.56M34.4 101l-2.2 0M34.87 99.87l-1.56 -1.56M36 99.4l-0 -2.2M37.13 99.87l1.56 -1.56M129.6 100l2.2 0M129.13 101.13l1.56 1.56M128 101.6l0 2.2M126.87 101.13l-1.56 1.56M126.4 100l-2.2 0M126.87 98.87l-1.56 -1.56M128 98.4l-0 -2.2M129.13 98.87l1.56 -1.56M281.6 101l2.2 0M281.13 102.13l1.56 1.56M280 102.6l0 2.2M278.87 102.13l-1.56 1.56M278.4 101l-2.2 0M278.87 99.87l-1.56 -1.56M280 99.4l-0 -2.2M281.13 99.87l1.56 -1.56";
const ASTER_CENTRES = "M36 101h0M128 100h0M280 101h0";

// Rabbit and cat are drawn standing on y=57 and moved into place. Each
// animal has an awake pose and an asleep one.
const RABBIT_BODY = "M364 57C360 51 364 45 373 45 380 45 385 46 388 47 390 43 398 43 399 48 400 52 396 55 392 55L391 57Z";
const RABBIT_TAIL = "M360 53a2 2 0 1 0 4 0 2 2 0 1 0-4 0";
const RABBIT_AWAKE = ["M390 45C387 40 381 38 378 39 381 42 385 44 389 46ZM392 44C391 38 386 35 383 35 385 39 388 42 391 45Z", "M395 48h0"];
// Ears laid flat along the back, eye shut.
const RABBIT_ASLEEP = [
  "M389 46C384 42 378 41 373 43 378 45 384 46 388 47ZM390 45C386 40 379 39 375 40 379 42 385 44 389 46Z",
  "M394 48q1 .8 2 0",
];

const CAT_AWAKE = [
  "M476 43.5C470 45 469 52 470.5 57H489.5C491 52 490 45 484 43.5ZM473.5 38.5C473.5 35.5 474 33 475 30.5L478.5 33C479.5 32.8 480.5 32.8 481.5 33L485 30.5C486 33 486.5 35.5 486.5 38.5 486.5 42 483.5 44.2 480 44.2 476.5 44.2 473.5 42 473.5 38.5Z",
  "M479 41.3q.5.6 1 0 .5.6 1 0M489.5 56c6 1 9-4 6-8M477 57v-3M483 57v-3M480 40.3h0M476.3 38.4q1.2-1.1 2.4 0M481.3 38.4q1.2-1.1 2.4 0",
];
// Curled up: head resting on the ground in front, tail wrapped round the
// body, eyes shut.
const CAT_ASLEEP = [
  "M474.5 51C476 46 481 44 487 44 494 44 499 49 498.5 57H474ZM461.5 51C461.5 48 462 45.5 463 43L466.5 45.5C467.5 45.3 468.5 45.3 469.5 45.5L473 43C474 45.5 474.5 48 474.5 51 474.5 54.5 471.5 56.7 468 56.7 464.5 56.7 461.5 54.5 461.5 51Z",
  "M464.3 50.5q1.2 1.1 2.4 0M469.3 50.5q1.2 1.1 2.4 0M467 53.8q.5.6 1 0 .5.6 1 0M468 52.8h0M497 53c-4 2.5-12 2.5-19 1.5",
];
// Two small z's rising from the sleeping cat's head.
const CAT_ZZ = ["M477 38h2.5l-2.5 2.5h2.5", "M481 30h3.5l-3.5 3.5h3.5"];

// The tree sways as one, bird included.
const TRUNK = "M152 113c4-3 6-8 6.5-16 .3-8 .5-17 .5-27h2c0 10 .2 19 .5 27 .5 8 2.5 13 6.5 16";
const BRANCHES = "M159 80c-8-4-18-9-26-20M161 80c8-4 18-9 26-20M159 72c-5-6-11-14-14-26M161 72c5-6 11-14 14-26M160 70V30M140 66c-5-1-9-4-11-8M180 66c5-1 9-4 11-8";

const BIRD_AWAKE = [
  "M611 36C609 32 602 32 601 37 596 40 590 43 584 42L588 46C592 51 606 52 610 45 612 42 612 39 611 36Z",
  "M611 36l5 2-5 1.5M596 42c4 3 8 3 10 1M600 50v3M604 50v3M607 36.5h0",
];
// Fluffed round, head lowered, beak tucked, eye shut.
const BIRD_ASLEEP = [
  "M611 40C611 34 604 33 600 36 594 39 589 43 584 42L588 46C592 51 606 51 610 47 611 45 611 42 611 40Z",
  "M611 40l3 3-3.5.5M597 43c4 2.5 8 2.5 10 .5M600 50v3M604 50v3M605 39.6q1 .8 2 0",
];

// Leaves in two colours (.leaves, .leaves-alt), plus extra leaves that fill
// the crown only in summer (.summer-only).
const LEAVES = "M128.7 28.3q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M189.5 36.6q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M148.2 68.5q4-4.2 8 0q-4 4.2-8 0M143.6 52.7q4-4.2 8 0q-4 4.2-8 0M117.2 49.4q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M155.4 58.2q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M153.3 19q4.2 4 0 8q-4.2-4 0-8M133.6 46.6q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M143.3 37.2q4-4.2 8 0q-4 4.2-8 0M133.4 58.9q4-4.2 8 0q-4 4.2-8 0M159.2 68.7q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M176 51.7q4-4.2 8 0q-4 4.2-8 0";
const LEAVES_ALT = "M168 19.7q4.2 4 0 8q-4.2-4 0-8M169.4 38.3q4.2 4 0 8q-4.2-4 0-8M157.9 32.9q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M164.2 50.3q4-4.2 8 0q-4 4.2-8 0M181.1 28.2q4-4.2 8 0q-4 4.2-8 0M121.8 59.9q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M186 47.3q4.2 4 0 8q-4.2-4 0-8M123.6 38.6q4-4.2 8 0q-4 4.2-8 0M140.2 20.2q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M197.7 49.8q4-4.2 8 0q-4 4.2-8 0M186.2 59.7q4-4.2 8 0q-4 4.2-8 0";
const SUMMER_LEAVES = "M118.1 30.5q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M189.4 25.1q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M138.4 69.3q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M133.8 35.6q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M198.2 39.9q4-4.2 8 0q-4 4.2-8 0M160 24.5q4-4.2 8 0q-4 4.2-8 0";
const SUMMER_LEAVES_ALT = "M150.5 27.4q4-4.2 8 0q-4 4.2-8 0M110.1 43q4-4.2 8 0q-4 4.2-8 0M171.7 27.5q4.2 4 0 8q-4.2-4 0-8M127.2 53.2q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3M180.3 37.4q-.8-5.3-6.6-5.3q.8 5.3 6.6 5.3M176.8 20.1q.8-5.3 6.6-5.3q-.8 5.3-6.6 5.3";

const SOFT = 'fill="currentColor" fill-opacity=".15"';

// Invisible shapes that give the sun, the moon and the tree a click target
// larger than their thin lines.
const HIT = 'fill="transparent" stroke="none"';
const SKY_HIT = `<circle cx="288" cy="20" r="14" ${HIT}/>`;
const TREE_HIT = `<ellipse cx="160" cy="48" rx="52" ry="40" ${HIT}/><rect x="150" y="80" width="20" height="33" ${HIT}/>`;

// An animal pose: its body (.fur, coloured by the stylesheet), then lines.
const pose = ([fur, lines], extra = "") => `<path class="fur" d="${fur}"/><path d="${lines}"/>${extra}`;

const poses = (awake, asleep) => `<g class="awake">${awake}</g><g class="asleep">${asleep}</g>`;

export const FOOTER_SCENE_SVG = `<svg class="footer-scene" viewBox="-80 0 480 130" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<g class="plants"><path d="${PLANTS_SOFT}" ${SOFT}/><path d="${PLANTS_LINES}"/></g>` +
  `<g class="summer-plants"><path d="${SUMMER_SOFT}" ${SOFT}/><path d="${SUMMER_LINES}"/></g>` +
  `<g class="spring-plants"><path d="${SPRING_LINES}"/><path class="bloom tulip" d="${TULIPS}" fill-opacity=".5"/></g>` +
  `<g class="autumn-plants"><path d="${AUTUMN_LINES}"/><path class="bloom aster" d="${ASTER_PETALS}"/><path class="bloom aster-centre" d="${ASTER_CENTRES}" stroke-width="2.4"/></g>` +
  `<g transform="translate(-293 56)"><path class="fur" d="${RABBIT_BODY}"/><path d="${RABBIT_TAIL}"/>${poses(pose(RABBIT_AWAKE), pose(RABBIT_ASLEEP))}</g>` +
  `<g transform="translate(-244 56)">${poses(pose(CAT_AWAKE), pose(CAT_ASLEEP, CAT_ZZ.map((d) => `<path class="zz" d="${d}"/>`).join("")))}</g>` +
  `<g class="day-sky sun">${SKY_HIT}<path d="${SUN_DISC}" fill-opacity=".3"/><path d="${SUN_RAYS}"/></g>` +
  `<g class="night-sky"><g class="moon">${SKY_HIT}<path d="${MOON}" ${SOFT}/></g><path d="${STARS}"/>${TWINKLES.map((d) => `<path class="twinkle" d="${d}"/>`).join("")}</g>` +
  `<g class="footer-tree">${TREE_HIT}<path d="${TRUNK}" ${SOFT}/><path d="${BRANCHES}"/>` +
  `<g transform="translate(626.8 31.9) scale(-0.75 0.75)">${poses(pose(BIRD_AWAKE), pose(BIRD_ASLEEP))}</g>` +
  `<g class="winter-only">${FEEDER}</g>` +
  `<path class="leaves" d="${LEAVES}" fill-opacity=".3"/>` +
  `<path class="leaves-alt" d="${LEAVES_ALT}" fill-opacity=".3"/>` +
  `<path class="leaves summer-only" d="${SUMMER_LEAVES}" fill-opacity=".3"/>` +
  `<path class="leaves-alt summer-only" d="${SUMMER_LEAVES_ALT}" fill-opacity=".3"/></g></svg>`;

// The low mound the scene stands on: flat where it stands, tapering off to
// either side. Drawn on the same grid as the scene but behind the footer's
// hill, so only the part rising above the crest shows.
const MOUND = "M-80 130C10 130 20 113 65 113H255C300 113 310 130 400 130z";

export const FOOTER_MOUND_SVG = `<svg class="footer-scene footer-mound" viewBox="-80 0 480 130" aria-hidden="true">` +
  `<path d="${MOUND}" fill="var(--footer-bg)"/></svg>`;

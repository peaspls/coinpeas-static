// The riddle's room, drawn in the same sketchy line style as the landing
// page's footer: lines in the ink colour with soft fills. The drawing is
// 720 x 400; the floor line is at y=330. Everything that moves is its own
// element (with an id or class) for riddle.js to move.
import {
  RABBIT_BODY,
  RABBIT_TAIL,
  RABBIT_AWAKE,
  RABBIT_ASLEEP,
  CAT_AWAKE,
  CAT_TAIL,
  CAT_ASLEEP,
  CAT_ZZ,
  BIRD_AWAKE,
} from "./animals.js";

export const FLOOR = 330;

// The word the cubes spell, and the order they first lie in on the floor.
export const WORD = "friends";
export const FLOOR_ORDER = ["e", "n", "f", "s", "i", "d", "r"];

// Where the cubes go: slots on top of the cupboard, and places on the floor
// in front of it, both 27 apart from x=364. They start in a basket on the
// shelf, and tumble out of its mouth (BASKET_MOUTH, where a cube's top-left
// corner starts) once it tips over.
const CUBE = 22;
export const slotX = (i) => 364 + i * 27;
export const BASKET_MOUTH = [344, 140];
export const SLOT_Y = 197 - CUBE;
export const FLOOR_CUBE_Y = FLOOR - CUBE;

// Where the animals stand (the middle of their feet) as the riddles unfold.
// The bird faces the window (mirrored) on the shelf, and the bowl at it.
export const SPOTS = {
  birdShelf: [280, 168],
  birdBowl: [124, 200],
  catRug: [262, FLOOR + 1],
  catShelf: [274, 168],
  rabbitFlap: [650, FLOOR],
  rabbitRug: [262, FLOOR + 1],
};

// The carrot that rolls out of the cupboard, lying on its side: where its
// shoulder (where the leaves start) is, first inside the cupboard and then
// on the floor in front of it. Its tip is CARROT_LENGTH to the right.
export const CARROT_INSIDE = [470, 289.5];
export const CARROT_FLOOR = [478, FLOOR - 4.5];
export const CARROT_LENGTH = 34;
// How far the rabbit's feet are behind its mouth (it faces left).
export const RABBIT_MOUTH = 30;

const CAT_SCALE = 1.75;
const BIRD_SCALE = 1.2;
const RABBIT_SCALE = 1.6;

// An animal pose: its body (.fur), then its lines.
const pose = ([fur, lines], extra = "") => `<path class="fur" d="${fur}"/><path d="${lines}"/>${extra}`;

// Draws an animal from the landing page's grid with the middle of its feet,
// (ax, ay) on that grid, at (0, 0); a negative s mirrors it. The class goes
// on an inner group, so CSS can animate it (with its own transform-origin)
// without disturbing the placement.
const atFeet = (s, ax, ay, inner, cls = "") =>
  `<g transform="translate(${-ax * s} ${-ay * Math.abs(s)}) scale(${s} ${Math.abs(s)})"><g class="${cls}">${inner}</g></g>`;

const at = (x, y, flip = 1) => `style="transform: translate(${x}px, ${y}px) scale(${flip}, 1)"`;

const rabbit = `<path class="fur" d="${RABBIT_BODY}"/><path d="${RABBIT_TAIL}"/>${pose(RABBIT_AWAKE)}`;
const sittingCat = pose(CAT_AWAKE, `<path d="${CAT_TAIL}"/>`);

const WALL = `<rect class="wall" width="720" height="${FLOOR}"/>`;

const FLOOR_DRAWING =
  `<rect class="floor" y="${FLOOR}" width="720" height="70"/>` +
  `<rect class="skirting" y="320" width="720" height="${FLOOR - 320}"/>` +
  `<path d="M0 ${FLOOR}H720"/>` +
  `<path class="faint" d="M60 352h70M210 372h90M390 352h60M520 380h80M640 356h50M20 388h40"/>`;

const WINDOW =
  // The view outside: sky, a green hill, the tree of life and the sun.
  `<rect class="sky" x="40" y="70" width="130" height="130"/>` +
  `<path class="hill" d="M40 176q60-24 130-6V200H40z"/>` +
  `<path d="M70 182v-16"/><circle class="crown" cx="70" cy="156" r="12"/>` +
  `<circle class="sun" cx="72" cy="98" r="9"/>` +
  `<path class="sun-ray" d="M72 84v-4M72 112v4M58 98h-4M86 98h4M62 88l-3-3M82 108l3 3M62 108l-3 3M82 88l3-3"/>` +
  // Frame, open panes and the sill.
  `<rect x="40" y="70" width="130" height="130"/>` +
  `<path class="pane" d="M40 70 16 82v106l24 12zM170 70l24 12v106l-24 12z"/>` +
  `<rect class="wood" x="28" y="200" width="154" height="9" rx="2"/>`;

// The bird's bowl on the sill, toward the shelf with the seeds, and the
// seeds it gets in the end.
const BOWL =
  `<path class="bowl" d="M134 191c1 6 7 9 16 9s15-3 16-9z"/>` +
  `<ellipse class="bowl-rim" cx="150" cy="191" rx="16" ry="2.6"/>` +
  `<path id="bowl-seeds" class="seed" d="M142 190.5h0M147 189.5h0M152 190h0M157 189.5h0M145 192h0M155 192h0M150 191.5h0"/>`;

// A shelf at window height, with the bag of seeds near its window end, the
// bird in the middle and the basket of cubes at the other end.
const SHELF =
  `<rect class="wood" x="196" y="168" width="166" height="7" rx="2"/>` +
  `<path d="M208 175l6 10M350 175l-6 10"/>`;

// A woven basket with the letter cubes in it, two of them peeking over the
// rim. It tips over to the right, around its bottom-right corner (at
// x=338), and ends up lying on its side on the shelf, its mouth at the end.
const BASKET =
  `<g id="basket">` +
  `<g class="basket-cubes">` +
  `<rect class="cube-face" x="309" y="139" width="22" height="22" rx="3" transform="rotate(-8 320 150)"/>` +
  `<rect class="cube-face" x="322" y="142" width="22" height="22" rx="3" transform="rotate(10 333 153)"/>` +
  `</g>` +
  `<path class="basket" d="M306 148h32l-3 20h-26z"/>` +
  `<path class="faint" d="M307 154.5h30M308 161h28M314 148.5l1 19M322 148.5v19M330 148.5l-1 19"/>` +
  `<path d="M305 148h34"/>` +
  `</g>`;

// It tips over to the left, toward the window, around its bottom-left
// corner (at x=230), and ends up lying on its side on the shelf with its
// opening at the shelf's edge.
const SEED_BAG =
  `<g id="seed-bag"><g transform="translate(230 168) scale(0.75) translate(-200 -168)">` +
  `<path class="sack" d="M200 168c-3-14 0-26 6-30l-2-7h20l-2 7c6 4 9 16 6 30z"/>` +
  `<path d="M206 138h16"/>` +
  `<path class="seed" d="M210 152h0M216 156h0M212 160h0M218 148h0"/>` +
  `</g></g>`;

// Seeds that pour from the tipped bag's mouth down into the bowl.
const FALLING_SEEDS =
  `<g id="falling-seeds">` +
  Array.from({ length: 8 }, () => `<circle class="falling-seed" r="1.4" cx="0" cy="0"/>`).join("") +
  `</g>`;

const RUG = `<ellipse class="rug" cx="262" cy="${FLOOR + 3}" rx="52" ry="8"/>`;

// A carrot lying on its side, its shoulder at (0, 0) and its tip to the
// right; the body (.carrot-root) can shrink toward the leaves as it's eaten.
const carrot =
  `<g class="carrot-root"><path class="carrot-body" d="M0-4.5C9-4.5 26-2 34 0 26 2 9 4.5 0 4.5-1.5 4.5-1.5-4.5 0-4.5z"/>` +
  `<path class="carrot-line" d="M9-2.5l1.5 2.5M18-2l1.5 2M25-1.3l1 1.6"/></g>` +
  `<path class="leaf-line" d="M-1-1.5l-8-6M-1 0h-11M-1 1.5l-8 5.5"/>`;

// Inside the cupboard: a shelf with a jar on it, and below, a little bunch
// of carrots.
const CUPBOARD_INSIDE =
  `<rect class="inside" x="326" y="211" width="188" height="83"/>` +
  `<rect class="wood" x="326" y="249" width="188" height="5"/>` +
  `<path class="jar" d="M352 249c-2-10 0-17 3-19h12c3 2 5 9 3 19z"/><path d="M354 230h14"/>` +
  `<g transform="translate(362 283) rotate(-4)">${carrot}</g>` +
  `<g transform="translate(356 289.5)">${carrot}</g>`;

// Drawn from x=320 and moved 36 to the right, with the slots on top (where
// riddle.js puts the cubes) placed directly.
const CUPBOARD =
  `<g transform="translate(36 0)">` +
  `<path d="M334 300v28M506 300v28"/>` +
  `<rect class="wood" x="320" y="205" width="200" height="95" rx="3"/>` +
  CUPBOARD_INSIDE +
  `</g>` +
  // The carrot that rolls out, placed directly for riddle.js to move.
  `<g id="carrot" ${at(...CARROT_INSIDE)}>${carrot}</g>` +
  `<g transform="translate(36 0)">` +
  `<g class="cupboard-door left"><rect class="door-panel" x="326" y="211" width="91" height="83" rx="2"/><circle cx="410" cy="254" r="2.2"/></g>` +
  `<g class="cupboard-door right"><rect class="door-panel" x="423" y="211" width="91" height="83" rx="2"/><circle cx="430" cy="254" r="2.2"/></g>` +
  `<rect class="wood" x="312" y="197" width="216" height="8" rx="2"/>` +
  `</g>` +
  // The slots on top, shown once the cubes are out of the basket.
  `<g class="slots">` +
  Array.from({ length: WORD.length }, (_, i) =>
    `<rect class="slot" x="${slotX(i)}" y="${SLOT_Y}" width="${CUBE}" height="${CUBE}" rx="3"/>`).join("") +
  `</g>`;

// A close-up of the three friends together, filling the picture: the
// rabbit leaning in, the cat in the middle with the bird on its head,
// cropped by the frame. Drawn at 128 x 98 around (420, 112), and shown at
// 80% over the cupboard.
const PORTRAIT =
  `<g transform="translate(456 112) scale(0.8) translate(-420 -112)">` +
  `<path d="M420 38 372 56M420 38l48 18"/><circle cx="420" cy="38" r="2" class="ink"/>` +
  `<rect class="frame" x="356" y="56" width="128" height="98" rx="3"/>` +
  `<rect class="mat" x="364" y="64" width="112" height="82" rx="2"/>` +
  `<clipPath id="portrait-clip"><rect x="364" y="64" width="112" height="82" rx="2"/></clipPath>` +
  `<g clip-path="url(#portrait-clip)">` +
  `<g transform="translate(440 162)" stroke-width="0.85">${atFeet(2.6, 480, 57, sittingCat)}</g>` +
  `<g transform="translate(371 146)" stroke-width="0.85">${atFeet(2.6, 380, 57, rabbit)}</g>` +
  `<g transform="translate(441 100)" stroke-width="1.3">${atFeet(-1.5, 602, 53, pose(BIRD_AWAKE))}</g>` +
  `</g></g>`;

const DOOR =
  `<rect class="door-wood" x="568" y="98" width="114" height="232" rx="2"/>` +
  `<circle cx="588" cy="222" r="3.5"/>` +
  // The cat flap's opening, and the flap itself, hinged at the top.
  `<rect class="flap-hole" x="602" y="294" width="46" height="34" rx="5"/>` +
  `<g class="flap"><rect class="flap-door" x="602" y="294" width="46" height="34" rx="5"/><path d="M606 299h38"/></g>`;

// The rabbit comes in through the cat flap: at first only what's inside the
// flap's opening shows (#rabbit-way clips it), then it hops out. Awake, or
// asleep with its ears laid flat and z's over its head (not mirrored, so
// they read the right way round); riddle.js picks one with data-pose.
const RABBIT =
  `<clipPath id="flap-clip"><rect x="602" y="294" width="46" height="34" rx="5"/></clipPath>` +
  `<g id="rabbit-way" clip-path="url(#flap-clip)">` +
  `<g id="rabbit" data-pose="awake" ${at(...SPOTS.rabbitFlap)}>` +
  atFeet(-RABBIT_SCALE, 380, 57,
    `<path class="fur" d="${RABBIT_BODY}"/><path d="${RABBIT_TAIL}"/>` +
    `<g class="pose-awake">${pose(RABBIT_AWAKE)}</g><g class="pose-asleep">${pose(RABBIT_ASLEEP)}</g>`, "rabbit-body") +
  atFeet(RABBIT_SCALE, 492, 59, CAT_ZZ.map((d) => `<path class="zz" d="${d}"/>`).join(""), "pose-asleep") +
  `</g></g>`;

const cube = (letter, i) =>
  `<g class="cube" role="button" data-i="${i}" ${at(slotX(i), FLOOR_CUBE_Y)}>` +
  `<rect class="cube-face" width="${CUBE}" height="${CUBE}" rx="3"/>` +
  `<text x="${CUBE / 2}" y="${CUBE / 2 + 4.5}" text-anchor="middle" aria-hidden="true">${letter.toUpperCase()}</text></g>`;

const CUBES = FLOOR_ORDER.map(cube).join("");

// The cat: curled up asleep, or sitting up; riddle.js picks one with
// data-pose. An invisible rect makes it easier to click.
const CAT =
  `<g id="cat" role="button" data-pose="asleep" ${at(...SPOTS.catRug)}>` +
  `<rect x="-40" y="-52" width="80" height="54" fill="transparent" stroke="none"/>` +
  atFeet(CAT_SCALE, 480, 57, pose(CAT_ASLEEP) + CAT_ZZ.map((d) => `<path class="zz" d="${d}"/>`).join(""), "pose-asleep") +
  atFeet(CAT_SCALE, 480, 57, sittingCat, "pose-awake") +
  `</g>`;

// The bird, with its wing as its own line so it can flutter while the bird
// rests on the shelf (.resting, which riddle.js takes off while it flies).
const BIRD_WING = "M596 42c4 3 8 3 10 1";
const BIRD =
  `<g id="bird" class="resting" role="button" ${at(...SPOTS.birdShelf, -1)}>` +
  `<rect x="-26" y="-30" width="50" height="34" fill="transparent" stroke="none"/>` +
  atFeet(BIRD_SCALE, 602, 53, pose([BIRD_AWAKE[0], BIRD_AWAKE[1].replace(BIRD_WING, "")], `<path class="wing" d="${BIRD_WING}"/>`), "bird-body") +
  `</g>`;

// Little "speaking" lines: the bird's fanning up from its beak (flashed
// twice, for its two pips), and the cat's fanning left from its mouth (its
// "mau"), on the rug and up on the shelf.
const PIPS =
  `<path class="pip" d="M138 175l-1.5-5.5M142 174.5l1.5-5.5M145.5 177l4.5-3.5"/>` +
  `<path class="mau" d="M243 298.5l-4.5-4M242 304h-6M243 309.5l-5 2.5"/>` +
  `<path class="mau shelf-mau" d="M255 135.5l-4.5-4M254 141h-6M255 146.5l-5 2.5"/>`;

export const ROOM_SVG =
  `<svg class="room" viewBox="0 0 720 400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">` +
  WALL + FLOOR_DRAWING + WINDOW + BOWL + SHELF + SEED_BAG + BASKET + RUG + CUPBOARD + PORTRAIT + DOOR +
  RABBIT + CUBES + CAT + BIRD + FALLING_SEEDS + PIPS +
  `</svg>`;

// The riddle page: a room where the cat, the bird and the rabbit live, with
// two riddles, one after the other.
//
// 1. Send the bird to its empty bowl; its pipping wakes the cat, which then
//    (if clicked in time) jumps up on the shelf and pushes the bag of seeds
//    over, and the bird gets its dinner. Landing, the cat bumps the basket
//    of letter cubes, and they tumble to the floor.
// 2. Spell "friends" with the cubes in the cupboard's slots: the cupboard
//    opens, a carrot rolls out, and a rabbit comes in through the cat flap,
//    eats it, and goes to sleep on the cat's rug.
//
// When both are solved, the cat says "mau" now and then; clicking it then
// brings up "Play with cat" and "End".
import "./riddle.css";
import { ROOM_SVG, WORD, FLOOR_ORDER, slotX, SLOT_Y, FLOOR_CUBE_Y, BASKET_MOUTH, SPOTS, CARROT_INSIDE, CARROT_FLOOR, CARROT_LENGTH, RABBIT_MOUTH } from "./scene.js";

const roomEl = document.getElementById("room");
const statusEl = document.getElementById("status");
const actionsEl = document.getElementById("actions");

// With reduced motion, every move happens at once.
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const time = (ms) => (REDUCED ? 0 : ms);

// How long the cat sits up waiting for a click before lying down again.
const NAP_AFTER = 5000;

// How often the cat says "mau" once both riddles are solved.
const MAU_EVERY = 5000;

let room; // the current room's state; replaced on every reset

// Tells screen-reader users what just happened.
function say(text) {
  statusEl.textContent = text;
}

const translate = ([x, y], flip = 1) => `translate(${x}px, ${y}px) scale(${flip}, 1)`;

// Animates an element through transform keyframes and leaves it at the
// last one. Resolves early (and quietly) if the room is reset meanwhile.
async function move(el, frames, duration, easing = "ease-in-out") {
  const token = room;
  const anim = el.animate(frames.map((transform) => ({ transform })), {
    duration: time(duration),
    easing,
    fill: "forwards",
  });
  try {
    await anim.finished;
  } catch {
    return false;
  }
  el.style.transform = frames.at(-1);
  anim.cancel();
  return token === room;
}

function wait(ms) {
  const token = room;
  return new Promise((resolve) => setTimeout(() => resolve(token === room), time(ms)));
}

// ---------- The cubes ----------

function cubeLabel(cube) {
  const letter = cube.letter.toUpperCase();
  return cube.slot === null
    ? `Letter ${letter}, on the floor. Click to put it in the next free slot.`
    : `Letter ${letter}, in slot ${cube.slot + 1}. Click to put it back on the floor.`;
}

function clickCube(cube) {
  if (room.wordSolved || !room.cubesOut) return;
  if (cube.slot === null) {
    const slot = room.slots.indexOf(null);
    if (slot === -1) return;
    room.slots[slot] = cube;
    cube.slot = slot;
    cube.el.style.transform = translate([slotX(slot), SLOT_Y]);
  } else {
    room.slots[cube.slot] = null;
    cube.slot = null;
    cube.el.style.transform = translate([cube.homeX, FLOOR_CUBE_Y]);
  }
  cube.el.setAttribute("aria-label", cubeLabel(cube));

  if (room.slots.every(Boolean)) {
    const word = room.slots.map((c) => c.letter).join("");
    if (word === WORD) {
      solveWord();
    } else {
      say(`The slots spell “${word.toUpperCase()}”. That's not quite it.`);
      const slots = roomEl.querySelector(".slots");
      slots.classList.remove("nope");
      void slots.getBoundingClientRect();
      slots.classList.add("nope");
    }
  }
}

async function solveWord() {
  room.wordSolved = true;
  for (const cube of room.cubes) {
    cube.el.setAttribute("aria-disabled", "true");
  }
  say("FRIENDS! The cupboard opens, and a carrot rolls out onto the floor.");
  roomEl.querySelector(".room").classList.add("cupboard-open");
  if (!(await wait(900))) return;

  // A carrot rolls out, with a little hop over the edge, onto the floor.
  const carrot = roomEl.querySelector("#carrot");
  const [ix, iy] = CARROT_INSIDE;
  const [lx, ly] = CARROT_FLOOR;
  const roll = [[[ix, iy], 0], [[(ix + lx) / 2, iy - 8], -8], [[lx, ly], 0]]
    .map(([p, turn]) => `${translate(p)} rotate(${turn}deg)`);
  if (!(await move(carrot, roll, 600, "ease-in"))) return;
  if (!(await wait(400))) return;

  // The rabbit pokes its head in through the cat flap...
  const rabbit = roomEl.querySelector("#rabbit");
  roomEl.querySelector(".room").classList.add("flap-open");
  rabbit.classList.add("here");
  say("A rabbit pokes its head in through the cat flap.");
  if (!(await wait(1200))) return;

  // ...hops in and over to the carrot, its mouth at the carrot's tip...
  roomEl.querySelector("#rabbit-way").removeAttribute("clip-path");
  roomEl.querySelector(".room").classList.remove("flap-open");
  const [fx, fy] = SPOTS.rabbitFlap;
  const mouthAt = (length) => [lx + length * CARROT_LENGTH + RABBIT_MOUTH, fy];
  const [cx, cy] = mouthAt(1);
  if (!(await hopRabbit([fx, fy], [cx, cy], 6, 1600))) return;

  // ...and eats it, bite by bite from the tip, shuffling forward as it
  // gets shorter, until only the leaves are left.
  rabbit.classList.add("eating");
  say("The rabbit hops over to the carrot and starts nibbling.");
  const root = carrot.querySelector(".carrot-root");
  let spot = [cx, cy];
  for (const length of [0.75, 0.5, 0.25, 0]) {
    if (!(await wait(550))) return;
    root.style.scale = `${length} 1`;
    const next = mouthAt(length);
    if (!(await move(rabbit, [translate(spot), translate(next)], 175))) return;
    spot = next;
  }
  rabbit.classList.remove("eating");
  say("The rabbit has eaten the whole carrot, all but the leaves.");
  if (!(await wait(600))) return;

  // Full, it hops over to the cat's empty rug and goes to sleep.
  if (!(await hopRabbit(spot, SPOTS.rabbitRug, 8, 2000))) return;
  if (!(await wait(400))) return;
  rabbit.dataset.pose = "asleep";
  say("Full and happy, the rabbit hops over to the rug and falls asleep. Riddle solved!");
  if (!(await wait(1500))) return;
  solved();
}

// The rabbit hops along the floor from one spot to another, in a few hops.
function hopRabbit(from, to, count, duration) {
  const rabbit = roomEl.querySelector("#rabbit");
  const step = (to[0] - from[0]) / count;
  const hops = [];
  for (let i = 0; i < count; i++) {
    const x = from[0] + step * i;
    hops.push(translate([x, from[1]]), translate([x + step / 2, from[1] - 10]));
  }
  hops.push(translate(to));
  return move(rabbit, hops, duration, "linear");
}

// The basket tips over, and the cubes tumble out one by one, rolling over
// as they fall to their places on the floor; then the slots show.
async function spillTheCubes() {
  const svg = roomEl.querySelector(".room");
  svg.classList.add("basket-tipped");
  if (!(await wait(500))) return;
  svg.classList.add("cubes-out");
  const [mx, my] = BASKET_MOUTH;
  const done = await Promise.all(room.cubes.map(async (cube, i) => {
    if (!(await wait(i * 140))) return false;
    cube.el.classList.add("out");
    const home = [cube.homeX, FLOOR_CUBE_Y];
    const mid = [mx + (cube.homeX - mx) * 0.5, my + 14];
    const frames = [[[mx, my], 0], [mid, 140], [home, 360]].map(([p, turn]) => `${translate(p)} rotate(${turn}deg)`);
    if (!(await move(cube.el, frames, 900, "ease-in"))) return false;
    cube.el.style.transform = translate(home);
    return true;
  }));
  if (done.every(Boolean)) room.cubesOut = true;
}

// ---------- The bird, the cat and the seeds ----------

const catEl = () => roomEl.querySelector("#cat");
const birdEl = () => roomEl.querySelector("#bird");

function setCat(state, pose) {
  room.cat = state;
  catEl().dataset.pose = pose;
}

// The bird faces the window on the shelf (mirrored) and the bowl beside it.
async function flyBird(toBowl) {
  birdEl().classList.remove("resting");
  const shelf = translate(SPOTS.birdShelf, -1);
  const bowl = translate(SPOTS.birdBowl);
  const mid = translate([(SPOTS.birdShelf[0] + SPOTS.birdBowl[0]) / 2, 120], toBowl ? 1 : -1);
  const arrived = await move(birdEl(), toBowl ? [shelf, mid, bowl] : [bowl, mid, shelf], 1300);
  if (arrived && !toBowl) birdEl().classList.add("resting");
  return arrived;
}

async function clickBird() {
  if (room.busy || room.seedsSolved) return;
  if (room.bird === "shelf") {
    room.busy = true;
    say("The bird flies over to its bowl on the window sill.");
    if (!(await flyBird(true))) return;
    room.bird = "bowl";
    await peekAndPip();
    room.busy = false;
  } else if (room.bird === "bowl") {
    // Back to the shelf; with nobody left at the bowl, the cat lies down again.
    room.busy = true;
    clearTimeout(room.napTimer);
    if (room.cat === "up") {
      setCat("asleep", "asleep");
      say("The bird flies back to the shelf, and the cat lies down and goes back to sleep.");
    } else {
      say("The bird flies back to the shelf.");
    }
    if (!(await flyBird(false))) return;
    room.bird = "shelf";
    room.busy = false;
  }
}

// The bird looks into its empty bowl and pips twice; that wakes the cat a
// little, if it's still asleep on its rug.
async function peekAndPip() {
  const body = birdEl().querySelector(".bird-body");
  body.classList.add("peek");
  if (!(await wait(700))) return;
  body.classList.remove("peek");
  const pip = roomEl.querySelector(".pip");
  for (let i = 0; i < 2; i++) {
    pip.classList.add("show");
    if (!(await wait(350))) return;
    pip.classList.remove("show");
    if (!(await wait(250))) return;
  }
  say("The bowl is empty. The bird pips twice.");
  if (room.cat === "asleep") {
    if (!(await wait(400))) return;
    setCat("up", "awake");
    const mau = roomEl.querySelector(".mau:not(.shelf-mau)");
    mau.classList.add("show");
    say("Pip, pip! The cat sits up and says “mau”.");
    clearTimeout(room.napTimer);
    room.napTimer = setTimeout(goBackToSleep, NAP_AFTER);
    setTimeout(() => mau.classList.remove("show"), time(1600));
  }
}

// Nobody came: the cat lies down again, and the bird gives up on its empty
// bowl and flies back to the shelf.
async function goBackToSleep() {
  if (room.cat !== "up") return;
  setCat("asleep", "asleep");
  if (room.bird !== "bowl" || room.busy) {
    say("The cat lies down and goes back to sleep.");
    return;
  }
  room.busy = true;
  say("The cat lies down and goes back to sleep, and the bird flies back to the shelf.");
  if (!(await flyBird(false))) return;
  room.bird = "shelf";
  room.busy = false;
}

async function clickCat() {
  if (room.inviting) {
    inviteToPlay();
    return;
  }
  if (room.busy || room.seedsSolved) return;
  if (room.cat === "asleep") {
    say("The cat is fast asleep.");
  } else if (room.cat === "up") {
    clearTimeout(room.napTimer);
    pushTheBag();
  }
}

// A jump in a gentle arc, peaking above the higher of the two spots.
function jumpCat(from, to) {
  const top = Math.min(from[1], to[1]) - 50;
  const mid = [(from[0] + to[0]) / 2, top];
  return move(catEl(), [translate(from), translate(mid), translate(to)], 900, "ease-in-out");
}

async function pushTheBag() {
  room.busy = true;
  setCat("moving", "awake");
  say("The cat jumps up onto the shelf, behind the bag of seeds. Its tail bumps the basket, and the letter cubes tumble to the floor…");
  if (!(await jumpCat(SPOTS.catRug, SPOTS.catShelf))) return;
  spillTheCubes();
  const [cx, cy] = SPOTS.catShelf;
  if (!(await move(catEl(), [translate([cx, cy]), translate([cx - 12, cy]), translate([cx, cy])], 500))) return;

  // The bag tips over toward the window, and seeds pour into the bowl.
  roomEl.querySelector(".room").classList.add("bag-tipped");
  say("…and pushes it over. Seeds pour down into the bowl!");
  if (!(await wait(500))) return;
  const seeds = [...roomEl.querySelectorAll(".falling-seed")];
  await Promise.all(seeds.map((seed, i) => {
    const from = `translate(${202 + (i % 3)}px, ${157 + (i % 2)}px)`;
    const mid = `translate(${184 - i * 2}px, ${163 + (i % 3)}px)`;
    const to = `translate(${143 + i * 2}px, ${189 + (i % 2)}px)`;
    return seed.animate(
      [{ transform: from, opacity: 1 }, { transform: mid, opacity: 1 }, { transform: to, opacity: 1 }, { transform: to, opacity: 0 }],
      { duration: time(900), delay: time(i * 110), easing: "ease-in", fill: "forwards" },
    ).finished.catch(() => {});
  }));
  if (!(await wait(0))) return;
  roomEl.querySelector(".room").classList.add("bowl-full");
  birdEl().classList.add("eating");
  room.seedsSolved = true;
  room.busy = false;
  say("The bird starts eating the seeds. Riddle solved! Now the letter cubes on the floor fit the slots on the cupboard.");
  solved();
}

// ---------- Both solved ----------

// With everyone fed, the cat up on the shelf says "mau" every few seconds,
// until it's clicked.
function solved() {
  if (!room.wordSolved || !room.seedsSolved) return;
  room.inviting = true;
  say("You solved both riddles! The friends are fed and happy. The cat on the shelf keeps saying “mau”.");
  const mau = roomEl.querySelector(".shelf-mau");
  const speak = () => {
    mau.classList.add("show");
    setTimeout(() => mau.classList.remove("show"), 1200);
  };
  speak();
  room.mauTimer = setInterval(speak, MAU_EVERY);
}

function inviteToPlay() {
  room.inviting = false;
  clearInterval(room.mauTimer);
  roomEl.querySelector(".shelf-mau").classList.remove("show");
  actionsEl.hidden = false;
  say("The cat would like to play with you.");
}

// ---------- Setting up (and resetting) the room ----------

function setUp() {
  if (room) {
    clearTimeout(room.napTimer);
    clearInterval(room.mauTimer);
  }
  roomEl.innerHTML = ROOM_SVG;
  actionsEl.hidden = true;
  room = {
    cubes: [...roomEl.querySelectorAll(".cube")].map((el, i) => ({
      el,
      letter: FLOOR_ORDER[i],
      slot: null,
      homeX: slotX(i),
    })),
    slots: Array(WORD.length).fill(null),
    cubesOut: false,
    wordSolved: false,
    seedsSolved: false,
    bird: "shelf",
    cat: "asleep",
    busy: false,
    napTimer: 0,
    inviting: false,
    mauTimer: 0,
  };
  for (const cube of room.cubes) {
    cube.el.setAttribute("aria-label", cubeLabel(cube));
    cube.el.addEventListener("click", () => clickCube(cube));
  }
  catEl().setAttribute("aria-label", "The cat");
  birdEl().setAttribute("aria-label", "The bird");
  catEl().addEventListener("click", clickCat);
  birdEl().addEventListener("click", clickBird);
  say("");
}

document.getElementById("end").addEventListener("click", setUp);

setUp();

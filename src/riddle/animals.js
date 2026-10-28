// The rabbit, the cat and the bird, drawn in lines with a soft-filled body
// (the first path of each pose; the second is its lines). Rabbit and cat
// stand on y=57; the bird perches with its feet at about (602, 53).
export const RABBIT_BODY = "M364 57C360 51 364 45 373 45 380 45 385 46 388 47 390 43 398 43 399 48 400 52 396 55 392 55L391 57Z";
export const RABBIT_TAIL = "M360 53a2 2 0 1 0 4 0 2 2 0 1 0-4 0";
export const RABBIT_AWAKE = ["M390 45C387 40 381 38 378 39 381 42 385 44 389 46ZM392 44C391 38 386 35 383 35 385 39 388 42 391 45Z", "M395 48h0"];
// Ears laid flat along the back, eye shut.
export const RABBIT_ASLEEP = [
  "M389 46C384 42 378 41 373 43 378 45 384 46 388 47ZM390 45C386 40 379 39 375 40 379 42 385 44 389 46Z",
  "M394 48q1 .8 2 0",
];

// Sitting up, facing us.
export const CAT_AWAKE = [
  "M476 43.5C470 45 469 52 470.5 57H489.5C491 52 490 45 484 43.5ZM473.5 38.5C473.5 35.5 474 33 475 30.5L478.5 33C479.5 32.8 480.5 32.8 481.5 33L485 30.5C486 33 486.5 35.5 486.5 38.5 486.5 42 483.5 44.2 480 44.2 476.5 44.2 473.5 42 473.5 38.5Z",
  "M479 41.3q.5.6 1 0 .5.6 1 0M477 57v-3M483 57v-3M480 40.3h0M476.3 38.4q1.2-1.1 2.4 0M481.3 38.4q1.2-1.1 2.4 0",
];
export const CAT_TAIL = "M489.5 56c6 1 9-4 6-8";
// Curled up: head resting on the ground in front, tail wrapped round the
// body, eyes shut.
export const CAT_ASLEEP = [
  "M474.5 51C476 46 481 44 487 44 494 44 499 49 498.5 57H474ZM461.5 51C461.5 48 462 45.5 463 43L466.5 45.5C467.5 45.3 468.5 45.3 469.5 45.5L473 43C474 45.5 474.5 48 474.5 51 474.5 54.5 471.5 56.7 468 56.7 464.5 56.7 461.5 54.5 461.5 51Z",
  "M464.3 50.5q1.2 1.1 2.4 0M469.3 50.5q1.2 1.1 2.4 0M467 53.8q.5.6 1 0 .5.6 1 0M468 52.8h0M497 53c-4 2.5-12 2.5-19 1.5",
];
// Two small z's rising from the sleeping cat's head.
export const CAT_ZZ = ["M477 38h2.5l-2.5 2.5h2.5", "M481 30h3.5l-3.5 3.5h3.5"];

export const BIRD_AWAKE = [
  "M611 36C609 32 602 32 601 37 596 40 590 43 584 42L588 46C592 51 606 52 610 45 612 42 612 39 611 36Z",
  "M611 36l5 2-5 1.5M596 42c4 3 8 3 10 1M600 50v3M604 50v3M607 36.5h0",
];

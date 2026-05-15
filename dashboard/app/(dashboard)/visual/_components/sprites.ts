// Hand-drawn pixel-art sprites. Each row is a string of '.' (transparent) and 'X' (filled).
// Width is the length of each row. Height is the number of rows.
// All sprites are monochrome — color is supplied at render time from the agent's accent.

export type Sprite = string[];

// ───────────────────────────────────────────────────────────────────────────
// Characters — 14 cols × 22 rows
// Each agent has a distinct silhouette so they're recognizable at a glance.
// ───────────────────────────────────────────────────────────────────────────

// Scanner — thin frame with an antenna (he scans the network)
export const SCANNER_IDLE: Sprite = [
  '......X.......',
  '......X.......',
  '....XXXXX.....',
  '....X...X.....',
  '....X.X.X.....',
  '....X...X.....',
  '....XXXXX.....',
  '.....XXX......',
  '...XXXXXXX....',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '....XXXXX.....',
  '....X...X.....',
  '....X...X.....',
  '....X...X.....',
  '....X...X.....',
  '....X...X.....',
  '...XX...XX....',
  '...XX...XX....',
];

export const SCANNER_BUSY: Sprite = [
  '......X.......',
  '..X...X...X...',
  '..XXXXXXXXX...',
  '....X...X.....',
  '....X.X.X.....',
  '....X...X.....',
  '....XXXXX.....',
  '.....XXX......',
  '...XXXXXXX....',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '..X.XXXXX.X...',
  '....XXXXX.....',
  '....X...X.....',
  '....X...X.....',
  '....X...X.....',
  '....X...X.....',
  '....X...X.....',
  '...XX...XX....',
  '...XX...XX....',
];

// Intake — broader frame with a small clipboard/tie (chief of staff)
export const INTAKE_IDLE: Sprite = [
  '..............',
  '..............',
  '...XXXXXXXX...',
  '...X......X...',
  '...X.X..X.X...',
  '...X......X...',
  '...X.XXXX.X...',
  '...XXXXXXXX...',
  '....XXXXXX....',
  '..XXXXXXXXXX..',
  '.X.XXXXXXXX.X.',
  '.X.XXX..XXX.X.',
  '.X.XX....XX.X.',
  '.X.XXX..XXX.X.',
  '.X.XXXXXXXX.X.',
  '...XXXXXXXX...',
  '...X......X...',
  '...X......X...',
  '...X......X...',
  '...X......X...',
  '..XX......XX..',
  '..XX......XX..',
];

export const INTAKE_BUSY: Sprite = [
  '..............',
  '..............',
  '...XXXXXXXX...',
  '...X......X...',
  '...X.X..X.X...',
  '...X..XX..X...',
  '...X.XXXX.X...',
  '...XXXXXXXX...',
  '.X..XXXXXX..X.',
  '.X.XXXXXXXX.X.',
  '.XXXXXXXXXXXX.',
  '...XXX..XXX...',
  '...XX....XX...',
  '...XXX..XXX...',
  '...XXXXXXXX...',
  '...XXXXXXXX...',
  '...X......X...',
  '...X......X...',
  '...X......X...',
  '...X......X...',
  '..XX......XX..',
  '..XX......XX..',
];

// Analyst — figure with visor/glasses (always thinking)
export const ANALYST_IDLE: Sprite = [
  '..............',
  '..............',
  '....XXXXXX....',
  '....X....X....',
  '...XXXXXXXX...',
  '...XX.XX.XX...',  // glasses bar
  '....X....X....',
  '....XXXXXX....',
  '.....XXXX.....',
  '...XXXXXXXX...',
  '..X.XXXXXX.X..',
  '..X.XXXXXX.X..',
  '..X.XXXXXX.X..',
  '..X.XXXXXX.X..',
  '....XXXXXX....',
  '....X....X....',
  '....X....X....',
  '....X....X....',
  '....X....X....',
  '....X....X....',
  '...XX....XX...',
  '...XX....XX...',
];

export const ANALYST_BUSY: Sprite = [
  '..............',
  '..XX......XX..',
  '..XX.XXXX.XX..',
  '..XX.X..X.XX..',
  '..XXXXXXXXXX..',
  '..XXX.XX.XXX..',
  '..XX.X..X.XX..',
  '..XX.XXXX.XX..',
  '.....XXXX.....',
  '...XXXXXXXX...',
  '...XXXXXXXX...',
  '...XXXXXXXX...',
  '...XXXXXXXX...',
  '...XXXXXXXX...',
  '....XXXXXX....',
  '....X....X....',
  '....X....X....',
  '....X....X....',
  '....X....X....',
  '....X....X....',
  '...XX....XX...',
  '...XX....XX...',
];

// ───────────────────────────────────────────────────────────────────────────
// Furniture — drawn in the same accent color as the character.
// ───────────────────────────────────────────────────────────────────────────

// Monitor (12×8) — small CRT on the desk. Inner pixels stay dark.
export const MONITOR: Sprite = [
  'XXXXXXXXXXXX',
  'X..........X',
  'X..........X',
  'X..........X',
  'X..........X',
  'X..........X',
  'XXXXXXXXXXXX',
  '....XXXX....',
];

// Monitor (busy) — inner pixels filled to suggest a glowing screen.
export const MONITOR_BUSY: Sprite = [
  'XXXXXXXXXXXX',
  'XXXXXXXXXXXX',
  'XX.X.X.X.XXX',
  'XXX.X.X.X.XX',
  'XX.X.X.X.XXX',
  'XXXXXXXXXXXX',
  'XXXXXXXXXXXX',
  '....XXXX....',
];

// Desk (32×4) — flat slab the monitor sits on.
export const DESK: Sprite = [
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'X..............................X',
  'X..............................X',
];

// "Zzz" sleep glyph (10×4) for idle floating animation.
export const ZZZ: Sprite = [
  'XX.XX.XXXX',
  '..X.X.X...',
  '.X..X..X..',
  'XX..XXXXXX',
];

// Spark/event glyph for busy state.
export const SPARK: Sprite = [
  '..X..',
  '.XXX.',
  'XX.XX',
  '.XXX.',
  '..X..',
];

export const SPRITE_FOR = {
  scanner: { idle: SCANNER_IDLE, busy: SCANNER_BUSY },
  intake: { idle: INTAKE_IDLE, busy: INTAKE_BUSY },
  analyst: { idle: ANALYST_IDLE, busy: ANALYST_BUSY },
} as const;

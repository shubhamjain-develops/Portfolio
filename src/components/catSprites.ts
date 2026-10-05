/**
 * The cat's pixel art. Each string is one row of a sprite and each character
 * one cell: "." is empty, any other key is a colour from PALETTE. Positions
 * elsewhere are in cells, not pixels.
 */
export type Sprite = readonly string[];

/** One cell, in SVG units. The dock draws 32 cells across 160px (128px on phones), so every cell is a whole number of screen pixels. */
export const CELL = 8;

export const PALETTE: Record<string, string> = {
  k: "#1b2028", // outline
  w: "#eef2f5", // fur
  g: "#c3ccd6", // fur shade
  e: "#2cc8b0", // eyes
  l: "#ffffff", // eye glint
  p: "#ff926b", // nose, inner ear
  b: "#ffb3a1", // blush
  t: "#2cc8b0", // collar, laptop screen
  y: "#ffd166", // tag, hard hat, twinkle
  a: "#7aacff", // fish, nightcap
  h: "#ff7a6b", // hearts, sparks, envelope seal
  m: "#c47a3a", // drumstick, crumbs
  z: "#9aa7b5", // the z's
};

export const HEAD: Sprite = [
  "...k..............k.....",
  "...kk............kk.....",
  "...kpk..........kpk.....",
  "...kppkkkkkkkkkkppk.....",
  "..kwwwwwwwwwwwwwwwwk....",
  "..kwwwwwwwwwwwwwwwwk....",
  "..kwwwwwwwwwwwwwwwwk....",
  "..kwwwwwwwwwwwwwwwwk....",
  "..kwwwwwwwppwwwwwwwk....",
  "..kwwwwwwkwwkwwwwwwk....",
  "..kwwwwwwwkkwwwwwwwk....",
  "...kkwwwwwwwwwwwwkk.....",
];

/** Drawn at row 12, under the head. */
export const BODY: Sprite = [
  "....kttttttttttttk......",
  "....kwwwwwyywwwwwk......",
  "....kwwwwwwwwwwwwk......",
  "...kwwwwwwwwwwwwwwk.....",
  "...kwwwwgwwwwgwwwwk.....",
  "...kwwwwgwwwwgwwwwk.....",
  "...kwwwwgwwwwgwwwwk.....",
  "...kwwwwgwwwwgwwwwk.....",
  "...kwwwwkwwwwkwwwwk.....",
  "....kkkk.kkkk.kkkk......",
];

/** Three tail frames, drawn at (19, 10) and played 0-1-0-2. */
export const TAIL: readonly Sprite[] = [
  ["..kk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", "kwwk.", "wwk..", "kk..."],
  ["...kk", "..kwk", "..kwk", "..kwk", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", "kwwk.", "wwk..", "kk..."],
  ["kkk..", "kwwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", ".kwk.", "kwwk.", "wwk..", "kk..."],
];

/** One eye; the pair sits at (5, 6) and (15, 6) and shifts a cell to look aside. */
export const EYE: Sprite = ["le", "ee"];
export const EYE_SHUT: Sprite = ["ww", "kk"];
export const EYE_HAPPY: Sprite = ["kk", "ww"];
export const MOUTH_OPEN: Sprite = ["kk", "pp"];
export const CRUMBS: Sprite = ["m..m", ".m.."];

export const BLUSH: Sprite = ["b"];
/** Puffed cheeks push the face outline out by a cell on each side. */
export const CHEEK_L: Sprite = ["kw", "kw"];
export const CHEEK_R: Sprite = ["wk", "wk"];
export const CHEEK_L_FULL: Sprite = [".kw", "kww", "kww", ".kw"];
export const CHEEK_R_FULL: Sprite = ["wk.", "wwk", "wwk", "wk."];

/** Perched on top of the head, between the ears, at (6, 1). */
export const SUNGLASSES: Sprite = ["kkkkkkkkkk", "kalk..kalk"];
export const HARDHAT: Sprite = [
  "....kkkkkk....",
  "..kkyyyyyykk..",
  ".kyyyykyyyyyk.",
  ".kyyyykyyyyyk.",
  "kkkkkkkkkkkkkk",
];
export const NIGHTCAP: Sprite = [
  ".......kkk......",
  "......kwwwk.....",
  ".....kkwwwkk....",
  "...kkaaaaaaakk..",
  "..kaawaaaawaaak.",
  ".kaaaaaawaaaaaak",
  "kwwwwwwwwwwwwwwk",
  "kkkkkkkkkkkkkkkk",
];

export const LAPTOP: Sprite = [
  ".kkkkkkkkkkkk.",
  ".kttttttttttk.",
  ".ktwwwttttttk.",
  ".ktwwwwwwtttk.",
  ".ktwwtttttttk.",
  ".kkkkkkkkkkkk.",
  "kggggggggggggk",
  "kkkkkkkkkkkkkk",
];
export const ENVELOPE: Sprite = [
  "kkkkkkkkkkkk",
  "kwkwwwwwwkwk",
  "kwwkwwwwkwwk",
  "kwwwkhhkwwwk",
  "kwwwwhhwwwwk",
  "kkkkkkkkkkkk",
];

/** Treats sit at (24, 18). */
export const FISH: Sprite = [".kkk.k", "kakakk", "kaaakk", ".kkk.k"];
export const SHRIMP: Sprite = ["..kkkk", ".khhhk", "khhkk.", ".kk..."];
export const DRUMSTICK: Sprite = ["..kkk.", ".kmmmk", "kwkmmk", "kk.kk."];

export const HEART: Sprite = ["hh.hh", "hhhhh", ".hhh.", "..h.."];
export const SPARK: Sprite = [".h.", "hhh", ".h."];
export const TWINKLE: Sprite = [".y.", "yyy", ".y."];
export const Z_BIG: Sprite = ["zzz", "..z", ".z.", "zzz"];
export const Z_SMALL: Sprite = ["zz", "z."];

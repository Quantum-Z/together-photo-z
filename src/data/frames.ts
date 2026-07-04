export type PatternKind =
  | "none"
  | "hearts"
  | "cherry"
  | "flowers"
  | "clouds"
  | "bear"
  | "ribbon"
  | "gingham"
  | "checker"
  | "stripes"
  | "retro"
  | "vintage"
  | "galaxy"
  | "sparkle"
  | "polaroid"
  | "film"
  | "confetti"
  | "snow"
  | "halloween"
  | "balloons"
  | "summer";

export type Frame = {
  id: string;
  name: string;
  pack: "simple" | "pattern" | "seasonal";
  /** solid background, or [from,to] gradient */
  bg: string;
  gradient?: [string, string];
  /** inner mat colour shown as a border around each photo */
  mat: string;
  /** thin stroke around each photo slot */
  stroke: string;
  /** caption + date text colour */
  ink: string;
  pattern: PatternKind;
  patternColors: string[];
  dark?: boolean;
};

const f = (o: Frame): Frame => o;

export const FRAMES: Frame[] = [
  // ── Simple pack ─────────────────────────────────────────────
  f({ id: "black", name: "Black", pack: "simple", bg: "#15161a", mat: "#15161a", stroke: "#2c2e36", ink: "#f5f5f5", pattern: "none", patternColors: [], dark: true }),
  f({ id: "white", name: "White", pack: "simple", bg: "#ffffff", mat: "#ffffff", stroke: "#ececec", ink: "#3a3a3a", pattern: "none", patternColors: [] }),
  f({ id: "pink", name: "Pink", pack: "simple", bg: "#f6cdd9", mat: "#f6cdd9", stroke: "#eab4c6", ink: "#8a4257", pattern: "none", patternColors: [] }),
  f({ id: "cream", name: "Cream", pack: "simple", bg: "#e9e0c6", mat: "#e9e0c6", stroke: "#d6cba9", ink: "#7a6d4a", pattern: "none", patternColors: [] }),
  f({ id: "blue", name: "Blue", pack: "simple", bg: "#c3d7f2", mat: "#c3d7f2", stroke: "#a9c4e8", ink: "#3f5a80", pattern: "none", patternColors: [] }),
  f({ id: "mint", name: "Mint", pack: "simple", bg: "#c4e5cf", mat: "#c4e5cf", stroke: "#a9d5b8", ink: "#41725a", pattern: "none", patternColors: [] }),
  f({ id: "lavender", name: "Lavender", pack: "simple", bg: "#dcd0f0", mat: "#dcd0f0", stroke: "#c4b3e6", ink: "#5f4a86", pattern: "none", patternColors: [] }),
  f({ id: "slate", name: "Slate", pack: "simple", bg: "#5a5f68", mat: "#5a5f68", stroke: "#474c55", ink: "#eef0f3", pattern: "none", patternColors: [], dark: true }),

  // ── Pattern pack ────────────────────────────────────────────
  f({ id: "hearts", name: "Hearts", pack: "pattern", bg: "#fdeef0", mat: "#fff6f7", stroke: "#f3c9d1", ink: "#b25a6e", pattern: "hearts", patternColors: ["#f3a9ba", "#e8798f"] }),
  f({ id: "cherry", name: "Cherry", pack: "pattern", bg: "#eef3fb", mat: "#fbfcfe", stroke: "#cfd9ee", ink: "#5b6b8a", pattern: "cherry", patternColors: ["#e8798f", "#8fbf6b"] }),
  f({ id: "flowers", name: "Flowers", pack: "pattern", bg: "#f6f0e2", mat: "#fffaf0", stroke: "#e3d6b8", ink: "#8a7550", pattern: "flowers", patternColors: ["#f2b8c6", "#f6d67a"] }),
  f({ id: "clouds", name: "Clouds", pack: "pattern", bg: "#d9ecfb", gradient: ["#cfe6fa", "#eaf5ff"], mat: "#ffffff", stroke: "#cbe3f6", ink: "#4f7091", pattern: "clouds", patternColors: ["#ffffff", "#f4d06a"] }),
  f({ id: "bear", name: "Bear", pack: "pattern", bg: "#f3e7d6", mat: "#fdf6ea", stroke: "#e0cdb2", ink: "#8a6a48", pattern: "bear", patternColors: ["#c79a6a", "#8a6a48"] }),
  f({ id: "ribbon", name: "Ribbon", pack: "pattern", bg: "#fdeaf1", mat: "#fff7fb", stroke: "#f4c8dc", ink: "#a8557a", pattern: "ribbon", patternColors: ["#ef8fb4", "#d76a97"] }),
  f({ id: "gingham", name: "Gingham", pack: "pattern", bg: "#eef3e6", mat: "#fbfdf7", stroke: "#cddcbc", ink: "#5e7048", pattern: "gingham", patternColors: ["#a9c78a"] }),
  f({ id: "checker", name: "Checker", pack: "pattern", bg: "#eef2fb", mat: "#fbfcff", stroke: "#c9d5ef", ink: "#5b6b8a", pattern: "checker", patternColors: ["#b9cdee"] }),
  f({ id: "stripes", name: "Stripes", pack: "pattern", bg: "#f3eee4", mat: "#fdfbf5", stroke: "#dccdb2", ink: "#6f6144", pattern: "stripes", patternColors: ["#9fae7f", "#c9b98f"] }),
  f({ id: "retro", name: "Retro", pack: "pattern", bg: "#2a2340", gradient: ["#3a2c5c", "#1f1a30"], mat: "#1c1730", stroke: "#5b4a8a", ink: "#ffd8f0", pattern: "retro", patternColors: ["#ff7ac6", "#7ad9ff"], dark: true }),
  f({ id: "vintage", name: "Vintage", pack: "pattern", bg: "#d9c9a8", mat: "#e8dcc0", stroke: "#c2ac82", ink: "#6b5836", pattern: "vintage", patternColors: ["#b79a68"] }),
  f({ id: "galaxy", name: "Galaxy", pack: "pattern", bg: "#0f1330", gradient: ["#1b1f47", "#070912"], mat: "#0c0f24", stroke: "#33407a", ink: "#dfe4ff", pattern: "galaxy", patternColors: ["#ffffff", "#8ea2ff"], dark: true }),
  f({ id: "sparkle", name: "Sparkle", pack: "pattern", bg: "#1a1420", gradient: ["#2a2030", "#120d16"], mat: "#181220", stroke: "#4a3a52", ink: "#ffe9b8", pattern: "sparkle", patternColors: ["#ffd873", "#fff4c9"], dark: true }),
  f({ id: "polaroid", name: "Polaroid", pack: "pattern", bg: "#ffffff", mat: "#ffffff", stroke: "#e6e6e6", ink: "#4a4a4a", pattern: "polaroid", patternColors: [] }),
  f({ id: "film", name: "Film", pack: "pattern", bg: "#111214", mat: "#1a1b1e", stroke: "#333438", ink: "#f0f0f0", pattern: "film", patternColors: ["#ffffff"], dark: true }),

  // ── Seasonal pack ───────────────────────────────────────────
  f({ id: "christmas", name: "Christmas", pack: "seasonal", bg: "#123a2a", gradient: ["#1a4a36", "#0d2b1f"], mat: "#0f3324", stroke: "#2c5c46", ink: "#fbeecb", pattern: "snow", patternColors: ["#ffffff", "#e8b24a"], dark: true }),
  f({ id: "halloween", name: "Halloween", pack: "seasonal", bg: "#211427", gradient: ["#3a2140", "#160d1a"], mat: "#1c1220", stroke: "#4a2f56", ink: "#ffb347", pattern: "halloween", patternColors: ["#ff8c1a", "#c9a0ff"], dark: true }),
  f({ id: "valentine", name: "Valentine", pack: "seasonal", bg: "#fbdce4", gradient: ["#fbd0dc", "#ffe9ef"], mat: "#fff5f8", stroke: "#f3b6c7", ink: "#b23a5b", pattern: "hearts", patternColors: ["#ef6f92", "#f2a9be"] }),
  f({ id: "birthday", name: "Birthday", pack: "seasonal", bg: "#eef4ff", mat: "#ffffff", stroke: "#d4def2", ink: "#5b6b8a", pattern: "balloons", patternColors: ["#ff9bb3", "#8ec5ff", "#ffd873"] }),
  f({ id: "graduation", name: "Graduation", pack: "seasonal", bg: "#1a1d2b", gradient: ["#262a3e", "#12141d"], mat: "#171a26", stroke: "#3a4056", ink: "#f5e6a8", pattern: "confetti", patternColors: ["#f5c84b", "#e8e8e8"], dark: true }),
  f({ id: "summer", name: "Summer", pack: "seasonal", bg: "#cdeef5", gradient: ["#bfe9f2", "#eafbff"], mat: "#ffffff", stroke: "#b6dfe8", ink: "#3f7c8a", pattern: "summer", patternColors: ["#ffca3a", "#ff8fa3"] }),
];

export const getFrame = (id: string) => FRAMES.find((x) => x.id === id) ?? FRAMES[2];

export const PACKS: { id: Frame["pack"]; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "pattern", label: "Patterns" },
  { id: "seasonal", label: "Seasonal" },
];

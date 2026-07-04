export type StickerItem = {
  id: string;
  kind: "sticker";
  emoji: string;
  x: number; // 0..1 of strip width
  y: number; // 0..1 of strip height
  scale: number;
  rot: number; // degrees
};

export type TextItem = {
  id: string;
  kind: "text";
  text: string;
  x: number;
  y: number;
  scale: number;
  rot: number;
  color: string;
  font: string; // css font-family
  shadow: boolean;
};

export type Stroke = {
  id: string;
  kind: "draw";
  points: { x: number; y: number }[];
  color: string;
  width: number; // fraction of strip width
  tool: "brush" | "marker" | "pencil" | "glow";
};

export type Overlay = StickerItem | TextItem;

export const FONTS: { id: string; name: string; css: string }[] = [
  { id: "cute", name: "Cute", css: "'Baloo 2', system-ui, sans-serif" },
  { id: "hand", name: "Handwriting", css: "'Gaegu', cursive" },
  { id: "typewriter", name: "Typewriter", css: "'Courier New', monospace" },
  { id: "minimal", name: "Minimal", css: "'Poppins', system-ui, sans-serif" },
  { id: "bold", name: "Bold", css: "'Baloo 2', system-ui, sans-serif" },
];

// Layout definitions. Slots are normalized (0..1) rects inside the strip's
// inner content area. The renderer maps them to pixel space.

export type Slot = { x: number; y: number; w: number; h: number };

export type Layout = {
  id: string;
  name: string;
  /** aspect ratio = width / height of the whole strip */
  ratio: number;
  /** outer padding as fraction of the shorter side */
  pad: number;
  /** gap between slots as fraction of the shorter side */
  gap: number;
  /** base pixel width used for high-res export */
  exportWidth: number;
  slots: Slot[];
  /** reserve space at bottom for caption/date (fraction of height) */
  footer: number;
};

// Helper to build a grid of slots inside content box [0..1].
function grid(cols: number, rows: number, gap: number): Slot[] {
  const slots: Slot[] = [];
  const w = (1 - gap * (cols - 1)) / cols;
  const h = (1 - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ x: c * (w + gap), y: r * (h + gap), w, h });
    }
  }
  return slots;
}

export const LAYOUTS: Layout[] = [
  {
    id: "strip-1x4",
    name: "Korean Strip",
    ratio: 1 / 3.05,
    pad: 0.045,
    gap: 0.028,
    exportWidth: 720,
    footer: 0.12,
    slots: grid(1, 4, 0.028),
  },
  {
    id: "grid-2x2",
    name: "2 × 2",
    ratio: 1,
    pad: 0.04,
    gap: 0.028,
    exportWidth: 1080,
    footer: 0.09,
    slots: grid(2, 2, 0.028),
  },
  {
    id: "grid-2x4",
    name: "2 × 4",
    ratio: 0.6,
    pad: 0.035,
    gap: 0.022,
    exportWidth: 1000,
    footer: 0.08,
    slots: grid(2, 4, 0.022),
  },
  {
    id: "landscape",
    name: "Landscape",
    ratio: 16 / 10,
    pad: 0.05,
    gap: 0.04,
    exportWidth: 1600,
    footer: 0.12,
    slots: grid(1, 1, 0),
  },
  {
    id: "portrait",
    name: "Portrait",
    ratio: 10 / 14,
    pad: 0.06,
    gap: 0.04,
    exportWidth: 1000,
    footer: 0.12,
    slots: grid(1, 1, 0),
  },
  {
    id: "square",
    name: "Square",
    ratio: 1,
    pad: 0.06,
    gap: 0,
    exportWidth: 1080,
    footer: 0.12,
    slots: grid(1, 1, 0),
  },
];

export const getLayout = (id: string) =>
  LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];

export const photoCount = (id: string) => getLayout(id).slots.length;

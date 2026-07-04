export type Filter = { id: string; name: string; css: string };

// CSS filter strings — applied to the live camera preview AND baked into the
// final strip via canvas ctx.filter, so preview and export always match.
export const FILTERS: Filter[] = [
  { id: "original", name: "Original", css: "none" },
  { id: "mono", name: "Mono", css: "grayscale(1) contrast(1.05)" },
  { id: "film", name: "Film", css: "contrast(1.1) saturate(0.9) sepia(0.12) brightness(1.02)" },
  { id: "vintage", name: "Vintage", css: "sepia(0.35) contrast(0.95) saturate(1.1) brightness(1.03)" },
  { id: "retro", name: "Retro", css: "sepia(0.2) hue-rotate(-10deg) saturate(1.3) contrast(1.05)" },
  { id: "warm", name: "Warm", css: "sepia(0.2) saturate(1.2) brightness(1.05) hue-rotate(-8deg)" },
  { id: "cool", name: "Cool", css: "saturate(1.05) hue-rotate(10deg) brightness(1.03) contrast(1.02)" },
  { id: "dream", name: "Dream", css: "brightness(1.08) saturate(1.15) contrast(0.92) blur(0.3px)" },
  { id: "soft", name: "Soft", css: "brightness(1.06) contrast(0.9) saturate(0.95)" },
  { id: "peach", name: "Peach", css: "sepia(0.15) saturate(1.25) brightness(1.05) hue-rotate(-12deg)" },
  { id: "cafe", name: "Cafe", css: "sepia(0.28) saturate(1.05) contrast(1.05) brightness(0.98)" },
  { id: "kodak", name: "Kodak", css: "saturate(1.3) contrast(1.08) brightness(1.02) sepia(0.08)" },
  { id: "disposable", name: "Disposable", css: "contrast(1.2) saturate(1.35) brightness(1.05) sepia(0.1)" },
  { id: "vhs", name: "VHS", css: "saturate(1.4) contrast(1.15) hue-rotate(-6deg) brightness(1.02)" },
];

export const getFilter = (id: string) => FILTERS.find((f) => f.id === id) ?? FILTERS[0];

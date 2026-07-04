// Cute SVG motif builders. Each returns an SVG fragment centred at (cx,cy)
// scaled to roughly `s` pixels. Kept pure so the same output feeds both the
// on-screen preview and the rasterised export.

const t = (cx: number, cy: number, s: number, rot = 0) =>
  `transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s / 100})"`;

export type MotifFn = (cx: number, cy: number, s: number, col: string, rot?: number) => string;

export const MOTIFS: Record<string, MotifFn> = {
  heart: (cx, cy, s, c, r = 0) =>
    `<path ${t(cx, cy, s, r)} d="M0,30 C0,10 -30,5 -30,-12 C-30,-32 0,-32 0,-10 C0,-32 30,-32 30,-12 C30,5 0,10 0,30 Z" fill="${c}"/>`,
  star: (cx, cy, s, c, r = 0) =>
    `<path ${t(cx, cy, s, r)} d="M0,-32 L9,-10 L33,-10 L14,5 L21,29 L0,15 L-21,29 L-14,5 L-33,-10 L-9,-10 Z" fill="${c}"/>`,
  sparkle: (cx, cy, s, c, r = 0) =>
    `<path ${t(cx, cy, s, r)} d="M0,-34 C4,-10 10,-4 34,0 C10,4 4,10 0,34 C-4,10 -10,4 -34,0 C-10,-4 -4,-10 0,-34 Z" fill="${c}"/>`,
  flower: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}>${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<ellipse cx="0" cy="-18" rx="11" ry="17" fill="${c}" transform="rotate(${a})"/>`
      )
      .join("")}<circle r="9" fill="#ffe08a"/></g>`,
  cloud: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><circle cx="-16" cy="4" r="16" fill="${c}"/><circle cx="4" cy="-8" r="20" fill="${c}"/><circle cx="24" cy="4" r="15" fill="${c}"/><rect x="-30" y="4" width="66" height="16" rx="8" fill="${c}"/></g>`,
  cherry: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><path d="M-4,-30 C6,-18 -10,-8 8,10" stroke="#8a9a5b" stroke-width="4" fill="none"/><circle cx="-10" cy="14" r="12" fill="${c}"/><circle cx="12" cy="16" r="12" fill="${c}"/><circle cx="-13" cy="10" r="3" fill="#fff" opacity="0.6"/></g>`,
  bear: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><circle cx="-18" cy="-18" r="10" fill="${c}"/><circle cx="18" cy="-18" r="10" fill="${c}"/><circle r="24" fill="${c}"/><circle cx="-9" cy="-4" r="3.2" fill="#5a4038"/><circle cx="9" cy="-4" r="3.2" fill="#5a4038"/><ellipse cx="0" cy="8" rx="9" ry="7" fill="#fff5ef"/><circle cx="0" cy="5" r="3" fill="#5a4038"/></g>`,
  ribbon: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><path d="M0,0 L-26,-14 L-26,14 Z" fill="${c}"/><path d="M0,0 L26,-14 L26,14 Z" fill="${c}"/><circle r="7" fill="${c}"/><circle r="4" fill="#ffffff" opacity="0.5"/></g>`,
  bow: (cx, cy, s, c, r = 0) => MOTIFS.ribbon(cx, cy, s, c, r),
  cat: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><path d="M-22,-26 L-10,-8 L-26,-6 Z" fill="${c}"/><path d="M22,-26 L10,-8 L26,-6 Z" fill="${c}"/><circle r="22" fill="${c}"/><circle cx="-8" cy="-2" r="3" fill="#4a3b34"/><circle cx="8" cy="-2" r="3" fill="#4a3b34"/><path d="M-3,6 Q0,10 3,6" stroke="#4a3b34" stroke-width="2" fill="none"/></g>`,
  balloon: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><ellipse cx="0" cy="-6" rx="18" ry="22" fill="${c}"/><path d="M0,16 L-3,20 L3,20 Z" fill="${c}"/><path d="M0,20 q6,14 -2,28" stroke="#c9c2bb" stroke-width="2" fill="none"/></g>`,
  gift: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><rect x="-22" y="-14" width="44" height="34" rx="4" fill="${c}"/><rect x="-4" y="-14" width="8" height="34" fill="#ffffff" opacity="0.7"/><rect x="-22" y="-14" width="44" height="8" fill="#ffffff" opacity="0.5"/></g>`,
  snow: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)} stroke="${c}" stroke-width="3" stroke-linecap="round">${[0, 60, 120]
      .map((a) => `<line x1="-20" y1="0" x2="20" y2="0" transform="rotate(${a})"/>`)
      .join("")}</g>`,
  bat: (cx, cy, s, c, r = 0) =>
    `<path ${t(cx, cy, s, r)} d="M0,-6 C-6,-16 -14,-18 -20,-10 C-18,-14 -30,-14 -34,-2 C-24,-6 -20,2 -10,0 C-6,6 6,6 10,0 C20,2 24,-6 34,-2 C30,-14 18,-14 20,-10 C14,-18 6,-16 0,-6 Z" fill="${c}"/>`,
  ghost: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><path d="M-18,20 L-18,-4 A18,18 0 0 1 18,-4 L18,20 L10,12 L2,20 L-6,12 L-14,20 Z" fill="${c}"/><circle cx="-6" cy="-2" r="2.6" fill="#3a3a3a"/><circle cx="6" cy="-2" r="2.6" fill="#3a3a3a"/></g>`,
  cap: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><path d="M0,-8 L-30,4 L0,16 L30,4 Z" fill="${c}"/><path d="M20,8 L20,20" stroke="${c}" stroke-width="2"/><circle cx="20" cy="21" r="3" fill="#ffcf5a"/></g>`,
  sun: (cx, cy, s, c, r = 0) =>
    `<g ${t(cx, cy, s, r)}><circle r="14" fill="${c}"/>${Array.from({ length: 8 })
      .map(
        (_, i) =>
          `<line x1="0" y1="-20" x2="0" y2="-26" stroke="${c}" stroke-width="3" stroke-linecap="round" transform="rotate(${i * 45})"/>`
      )
      .join("")}</g>`,
  dot: (cx, cy, s, c) => `<circle cx="${cx}" cy="${cy}" r="${s / 12}" fill="${c}"/>`,
};

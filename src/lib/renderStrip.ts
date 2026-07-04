import { Frame, PatternKind } from "@/data/frames";
import { Layout } from "@/data/layouts";
import { MOTIFS } from "./motifs";
import { StickerItem, TextItem, Stroke } from "./types";

export type PixelRect = { x: number; y: number; w: number; h: number; r: number };

export type RenderOpts = {
  frame: Frame;
  layout: Layout;
  caption: string;
  dateStr: string;
  roomName?: string;
  stickers: StickerItem[];
  texts: TextItem[];
  strokes: Stroke[];
};

export type RenderResult = {
  W: number;
  H: number;
  photoRects: PixelRect[];
  back: string;
  front: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A repeating pattern tile for the frame background margins.
function patternDefs(kind: PatternKind, cols: string[], W: number): { def: string; fill: string } {
  const s = Math.round(W * 0.17);
  const c0 = cols[0] ?? "#ffffff";
  const c1 = cols[1] ?? c0;
  const c2 = cols[2] ?? c1;
  let body = "";
  const id = "pat_" + kind;

  switch (kind) {
    case "hearts":
      body = MOTIFS.heart(s * 0.28, s * 0.28, s * 0.4, c0, -12) + MOTIFS.heart(s * 0.75, s * 0.75, s * 0.34, c1, 14);
      break;
    case "cherry":
      body = MOTIFS.cherry(s * 0.3, s * 0.3, s * 0.42, c0) + MOTIFS.flower(s * 0.78, s * 0.74, s * 0.3, c1);
      break;
    case "flowers":
      body = MOTIFS.flower(s * 0.3, s * 0.3, s * 0.42, c0) + MOTIFS.flower(s * 0.76, s * 0.76, s * 0.34, c1, 20);
      break;
    case "clouds":
      body = MOTIFS.cloud(s * 0.35, s * 0.3, s * 0.5, c0) + MOTIFS.star(s * 0.8, s * 0.78, s * 0.22, c1);
      break;
    case "bear":
      body = MOTIFS.bear(s * 0.32, s * 0.32, s * 0.44, c0) + MOTIFS.heart(s * 0.8, s * 0.78, s * 0.24, c1);
      break;
    case "ribbon":
      body = MOTIFS.ribbon(s * 0.3, s * 0.3, s * 0.44, c0) + MOTIFS.heart(s * 0.78, s * 0.76, s * 0.24, c1);
      break;
    case "gingham":
      return {
        def: `<pattern id="${id}" width="${s * 0.5}" height="${s * 0.5}" patternUnits="userSpaceOnUse"><rect width="${s * 0.5}" height="${s * 0.5}" fill="${c0}" opacity="0.25"/><rect width="${s * 0.25}" height="${s * 0.25}" fill="${c0}" opacity="0.45"/><rect x="${s * 0.25}" y="${s * 0.25}" width="${s * 0.25}" height="${s * 0.25}" fill="${c0}" opacity="0.45"/></pattern>`,
        fill: `url(#${id})`,
      };
    case "checker":
      return {
        def: `<pattern id="${id}" width="${s * 0.5}" height="${s * 0.5}" patternUnits="userSpaceOnUse"><rect width="${s * 0.5}" height="${s * 0.5}" fill="none"/><rect width="${s * 0.25}" height="${s * 0.25}" fill="${c0}" opacity="0.5"/><rect x="${s * 0.25}" y="${s * 0.25}" width="${s * 0.25}" height="${s * 0.25}" fill="${c0}" opacity="0.5"/></pattern>`,
        fill: `url(#${id})`,
      };
    case "stripes":
      return {
        def: `<pattern id="${id}" width="${s * 0.34}" height="${s * 0.34}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${s * 0.34}" height="${s * 0.34}" fill="none"/><rect width="${s * 0.17}" height="${s * 0.34}" fill="${c0}" opacity="0.4"/></pattern>`,
        fill: `url(#${id})`,
      };
    case "vintage":
      return {
        def: `<pattern id="${id}" width="${s * 0.3}" height="${s * 0.3}" patternUnits="userSpaceOnUse"><circle cx="${s * 0.15}" cy="${s * 0.15}" r="${s * 0.03}" fill="${c0}" opacity="0.4"/></pattern>`,
        fill: `url(#${id})`,
      };
    case "galaxy":
      body = Array.from({ length: 10 })
        .map((_, i) => {
          const x = (Math.sin(i * 12.9) * 0.5 + 0.5) * s;
          const y = (Math.cos(i * 78.2) * 0.5 + 0.5) * s;
          const r = (i % 3 === 0) ? s * 0.02 : s * 0.008;
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 4 === 0 ? c1 : c0}" opacity="0.9"/>`;
        })
        .join("") + MOTIFS.sparkle(s * 0.5, s * 0.5, s * 0.2, c1);
      break;
    case "sparkle":
      body = MOTIFS.sparkle(s * 0.3, s * 0.3, s * 0.36, c0) + MOTIFS.sparkle(s * 0.75, s * 0.72, s * 0.24, c1) + MOTIFS.star(s * 0.8, s * 0.28, s * 0.16, c1);
      break;
    case "snow":
      body = MOTIFS.snow(s * 0.3, s * 0.3, s * 0.36, c0) + MOTIFS.star(s * 0.76, s * 0.74, s * 0.24, c1);
      break;
    case "halloween":
      body = MOTIFS.bat(s * 0.3, s * 0.3, s * 0.4, c0) + MOTIFS.ghost(s * 0.78, s * 0.74, s * 0.32, c1);
      break;
    case "balloons":
      body = MOTIFS.balloon(s * 0.28, s * 0.32, s * 0.42, c0) + MOTIFS.balloon(s * 0.74, s * 0.66, s * 0.36, c1) + MOTIFS.star(s * 0.8, s * 0.24, s * 0.16, c2);
      break;
    case "confetti":
      body = Array.from({ length: 8 })
        .map((_, i) => {
          const x = (Math.sin(i * 33.1) * 0.5 + 0.5) * s;
          const y = (Math.cos(i * 51.7) * 0.5 + 0.5) * s;
          return `<rect x="${x}" y="${y}" width="${s * 0.05}" height="${s * 0.09}" rx="2" fill="${[c0, c1, c2][i % 3]}" transform="rotate(${i * 40} ${x} ${y})"/>`;
        })
        .join("");
      break;
    case "summer":
      body = MOTIFS.sun(s * 0.3, s * 0.3, s * 0.4, c0) + MOTIFS.heart(s * 0.76, s * 0.74, s * 0.22, c1);
      break;
    default:
      return { def: "", fill: "" };
  }

  return {
    def: `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="none"/>${body}</pattern>`,
    fill: `url(#${id})`,
  };
}

function rounded(r: PixelRect, extra = "") {
  return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.r}" ${extra}/>`;
}

export function renderStrip(opts: RenderOpts): RenderResult {
  const { frame, layout } = opts;
  const W = layout.exportWidth;
  const H = Math.round(W / layout.ratio);
  const pad = layout.pad * W;
  const footerH = layout.footer * H;
  const innerX = pad;
  const innerY = pad;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2 - footerH;

  const matRects: PixelRect[] = layout.slots.map((sl) => {
    const x = innerX + sl.x * innerW;
    const y = innerY + sl.y * innerH;
    const w = sl.w * innerW;
    const h = sl.h * innerH;
    return { x, y, w, h, r: Math.min(w, h) * 0.05 };
  });

  const border = Math.min(innerW, innerH) * 0.018;
  const photoRects: PixelRect[] = matRects.map((m) => ({
    x: m.x + border,
    y: m.y + border,
    w: m.w - border * 2,
    h: m.h - border * 2,
    r: Math.max(0, m.r - border * 0.5),
  }));

  const pat = patternDefs(frame.pattern, frame.patternColors, W);
  const bgFill = frame.gradient ? "url(#bgGrad)" : frame.bg;
  const grad = frame.gradient
    ? `<linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${frame.gradient[0]}"/><stop offset="1" stop-color="${frame.gradient[1]}"/></linearGradient>`
    : "";

  // ── back layer: background, pattern, mats ──────────────────
  let back = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${grad}${pat.def}</defs>`;
  back += `<rect width="${W}" height="${H}" fill="${bgFill}"/>`;
  if (pat.fill) back += `<rect width="${W}" height="${H}" fill="${pat.fill}"/>`;
  for (const m of matRects) back += rounded(m, `fill="${frame.mat}"`);
  back += `</svg>`;

  // ── front layer: strokes, photo outlines, motifs, overlays ──
  let front = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="glow"><feGaussianBlur stdDeviation="${W * 0.006}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

  for (const p of photoRects)
    front += rounded(p, `fill="none" stroke="${frame.stroke}" stroke-width="${border * 0.4}"`);

  // film sprocket holes
  if (frame.pattern === "film") {
    const hw = W * 0.03;
    for (let y = pad; y < H - pad; y += W * 0.09) {
      front += `<rect x="${pad * 0.28}" y="${y}" width="${hw}" height="${W * 0.05}" rx="${hw * 0.3}" fill="#ffffff" opacity="0.85"/>`;
      front += `<rect x="${W - pad * 0.28 - hw}" y="${y}" width="${hw}" height="${W * 0.05}" rx="${hw * 0.3}" fill="#ffffff" opacity="0.85"/>`;
    }
  }
  // polaroid corner accents
  if (frame.pattern === "polaroid") {
    front += MOTIFS.heart(W * 0.12, pad * 0.55, W * 0.11, "#f2a9ba", -12);
    front += MOTIFS.star(W * 0.88, pad * 0.55, W * 0.09, "#f6d67a");
  }

  // corner accent motifs for cute packs
  const cornerMotif = (kind: PatternKind): keyof typeof MOTIFS | null => {
    const map: Partial<Record<PatternKind, keyof typeof MOTIFS>> = {
      hearts: "heart", cherry: "cherry", flowers: "flower", clouds: "cloud",
      bear: "bear", ribbon: "ribbon", galaxy: "star", sparkle: "sparkle",
      snow: "snow", halloween: "ghost", balloons: "balloon", summer: "sun",
    };
    return map[kind] ?? null;
  };
  const cm = cornerMotif(frame.pattern);
  if (cm) {
    const col = frame.patternColors[1] ?? frame.patternColors[0] ?? "#ffffff";
    front += MOTIFS[cm](pad * 0.62, pad * 0.62, W * 0.11, col, -10);
    front += MOTIFS[cm](W - pad * 0.62, H - footerH - pad * 0.2, W * 0.09, col, 12);
  }

  // user drawings
  for (const st of opts.strokes) {
    if (st.points.length < 2) continue;
    const d = st.points.map((p, i) => `${i ? "L" : "M"}${(p.x * W).toFixed(1)},${(p.y * H).toFixed(1)}`).join(" ");
    const w = st.width * W;
    const dash = st.tool === "pencil" ? `stroke-dasharray="${w * 0.1} ${w * 0.5}"` : "";
    const op = st.tool === "marker" ? 0.55 : 1;
    const filt = st.tool === "glow" ? `filter="url(#glow)"` : "";
    front += `<path d="${d}" fill="none" stroke="${st.color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${dash} ${filt}/>`;
  }

  // footer caption + date + room
  const cx = W / 2;
  const fy = H - footerH + footerH * 0.5;
  if (opts.caption)
    front += `<text x="${cx}" y="${fy}" font-family="'Baloo 2', cursive, sans-serif" font-size="${footerH * 0.4}" font-weight="700" fill="${frame.ink}" text-anchor="middle" dominant-baseline="middle">${esc(opts.caption)}</text>`;
  const meta = [opts.dateStr, opts.roomName].filter(Boolean).join("  ·  ");
  front += `<text x="${cx}" y="${H - footerH * 0.22}" font-family="'Courier New', monospace" font-size="${footerH * 0.22}" fill="${frame.ink}" opacity="0.75" text-anchor="middle">${esc(meta)}</text>`;

  // stickers
  for (const s of opts.stickers) {
    const px = s.x * W;
    const py = s.y * H;
    const size = s.scale * W * 0.12;
    front += `<text x="0" y="0" font-size="${size}" text-anchor="middle" dominant-baseline="central" transform="translate(${px} ${py}) rotate(${s.rot})">${esc(s.emoji)}</text>`;
  }

  // custom text
  for (const tx of opts.texts) {
    const px = tx.x * W;
    const py = tx.y * H;
    const size = tx.scale * W * 0.05;
    const sh = tx.shadow ? `style="paint-order:stroke" stroke="rgba(0,0,0,0.25)" stroke-width="${size * 0.06}"` : "";
    front += `<text x="0" y="0" font-family="${tx.font}" font-size="${size}" font-weight="700" fill="${tx.color}" text-anchor="middle" dominant-baseline="central" ${sh} transform="translate(${px} ${py}) rotate(${tx.rot})">${esc(tx.text)}</text>`;
  }

  front += `</svg>`;

  return { W, H, photoRects, back, front };
}

import { renderStrip, RenderOpts, PixelRect } from "./renderStrip";
import { getFilter } from "@/data/filters";

function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

const imgCache = new Map<string, HTMLImageElement>();
function loadPhoto(src: string): Promise<HTMLImageElement> {
  const cached = imgCache.get(src);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function roundedPath(ctx: CanvasRenderingContext2D, r: PixelRect) {
  const rad = r.r;
  ctx.beginPath();
  ctx.moveTo(r.x + rad, r.y);
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
  ctx.closePath();
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, r: PixelRect) {
  const ar = img.width / img.height;
  const rr = r.w / r.h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (ar > rr) {
    sw = img.height * rr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / rr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, r.x, r.y, r.w, r.h);
}

export type ComposeOpts = RenderOpts & {
  photos: (string | null)[];
  filterId: string;
  scale?: number;
};

/** Draw the full strip onto `canvas`. Same path for live preview and export. */
export async function composeStrip(canvas: HTMLCanvasElement, opts: ComposeOpts) {
  const { W, H, photoRects, back, front } = renderStrip(opts);
  const scale = opts.scale ?? 1;
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const [backImg, frontImg] = await Promise.all([svgToImage(back), svgToImage(front)]);
  ctx.drawImage(backImg, 0, 0, W, H);

  const css = getFilter(opts.filterId).css;
  for (let i = 0; i < photoRects.length; i++) {
    const src = opts.photos[i];
    if (!src) continue;
    try {
      const img = await loadPhoto(src);
      ctx.save();
      roundedPath(ctx, photoRects[i]);
      ctx.clip();
      ctx.filter = css === "none" ? "none" : css;
      drawCover(ctx, img, photoRects[i]);
      ctx.restore();
    } catch {
      /* skip broken photo */
    }
  }
  ctx.filter = "none";
  ctx.drawImage(frontImg, 0, 0, W, H);
  return { W, H };
}

export async function exportStrip(
  opts: ComposeOpts,
  format: "png" | "jpeg"
): Promise<string> {
  const canvas = document.createElement("canvas");
  await composeStrip(canvas, { ...opts, scale: 2 });
  return canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

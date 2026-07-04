"use client";
import { useEffect, useRef } from "react";
import { useBooth } from "@/store/booth";
import { getFrame } from "@/data/frames";
import { getLayout } from "@/data/layouts";
import { composeStrip } from "@/lib/compose";
import { todayStr } from "@/lib/utils";

export function StripCanvas({ className, scale = 1 }: { className?: string; scale?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const s = useBooth();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    composeStrip(canvas, {
      frame: getFrame(s.frameId),
      layout: getLayout(s.layoutId),
      filterId: s.filterId,
      caption: s.caption,
      dateStr: todayStr(),
      roomName: s.roomName,
      photos: s.photos,
      stickers: s.stickers,
      texts: s.texts,
      strokes: s.strokes,
      scale,
    }).catch(() => {});
    return () => {
      cancelled = true;
      void cancelled;
    };
  }, [s.frameId, s.layoutId, s.filterId, s.caption, s.roomName, s.photos, s.stickers, s.texts, s.strokes, scale]);

  return <canvas ref={ref} className={className} style={{ width: "100%", height: "auto", display: "block" }} />;
}

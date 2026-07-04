"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { StripCanvas } from "@/components/StripCanvas";
import { useBooth } from "@/store/booth";
import { Stroke } from "@/lib/types";

const uid = () => Math.random().toString(36).slice(2, 9);

export function OverlayEditor({
  mode,
  drawColor,
  drawTool,
  drawWidth,
}: {
  mode: "select" | "draw";
  drawColor: string;
  drawTool: Stroke["tool"];
  drawWidth: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const s = useBooth();
  const overlays = [...s.stickers, ...s.texts];
  const drawing = useRef<Stroke | null>(null);
  const [, force] = useState(0);

  const rel = (e: React.PointerEvent) => {
    const r = wrap.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  // dragging overlays
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const onOverlayDown = (e: React.PointerEvent, id: string, x: number, y: number) => {
    e.stopPropagation();
    const p = rel(e);
    s.select(id);
    dragging.current = { id, ox: x - p.x, oy: y - p.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (mode === "draw" && drawing.current) {
      const p = rel(e);
      drawing.current.points.push(p);
      force((n) => n + 1);
      return;
    }
    if (dragging.current) {
      const p = rel(e);
      const { id, ox, oy } = dragging.current;
      s.updateOverlay(id, {
        x: Math.max(0, Math.min(1, p.x + ox)),
        y: Math.max(0, Math.min(1, p.y + oy)),
      });
    }
  };

  const onDown = (e: React.PointerEvent) => {
    if (mode === "draw") {
      const p = rel(e);
      drawing.current = { id: uid(), kind: "draw", points: [p], color: drawColor, width: drawWidth, tool: drawTool };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else {
      s.select(null);
    }
  };

  const onUp = () => {
    if (drawing.current && drawing.current.points.length > 1) s.addStroke(drawing.current);
    drawing.current = null;
    dragging.current = null;
  };

  return (
    <div
      ref={wrap}
      className="relative w-full touch-none select-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      style={{ cursor: mode === "draw" ? "crosshair" : "default" }}
    >
      <StripCanvas />

      {/* live drawing preview */}
      {drawing.current && drawing.current.points.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1 1" preserveAspectRatio="none">
          <path
            d={drawing.current.points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={drawColor}
            strokeWidth={drawWidth}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: drawWidth * (wrap.current?.clientWidth ?? 300) }}
          />
        </svg>
      )}

      {/* hit areas / selection */}
      {mode === "select" &&
        overlays.map((o) => {
          const selected = s.selectedId === o.id;
          const size = o.kind === "sticker" ? o.scale * 12 : o.scale * 7;
          return (
            <div
              key={o.id}
              onPointerDown={(e) => onOverlayDown(e, o.id, o.x, o.y)}
              className="absolute"
              style={{
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                width: `${size}%`,
                height: `${size}%`,
                transform: `translate(-50%,-50%) rotate(${o.rot}deg)`,
                cursor: "grab",
              }}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-[-6px] rounded-lg border-2 border-dashed border-pink-400"
                />
              )}
            </div>
          );
        })}
    </div>
  );
}

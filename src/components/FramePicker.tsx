"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FRAMES, PACKS, getFrame, Frame } from "@/data/frames";
import { getLayout } from "@/data/layouts";
import { renderStrip } from "@/lib/renderStrip";
import { useBooth } from "@/store/booth";
import { cn } from "@/lib/utils";
import { useRoom } from "@/hooks/RoomProvider";

export function FrameThumb({ frame, active }: { frame: Frame; active?: boolean }) {
  const svg = useMemo(() => {
    const layout = { ...getLayout("strip-1x4"), exportWidth: 220 };
    const r = renderStrip({
      frame,
      layout,
      caption: "",
      dateStr: "",
      stickers: [],
      texts: [],
      strokes: [],
    });
    return { back: r.back, front: r.front, ratio: r.W / r.H };
  }, [frame]);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      animate={active ? { scale: 1.04 } : { scale: 1 }}
      className={cn(
        "relative rounded-2xl overflow-hidden bg-white/60",
        active ? "ring-4 ring-pink-400/70 shadow-xl" : "ring-1 ring-black/5"
      )}
      style={{ aspectRatio: svg.ratio }}
    >
      <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: svg.back }} />
      <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: svg.front }} />
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full brand-grad text-white grid place-items-center text-xs shadow"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

export function FramePicker() {
  const { frameId, setFrame } = useBooth();
  const room = useSafeRoom();
  const [pack, setPack] = useState<Frame["pack"]>(getFrame(frameId).pack);
  const list = FRAMES.filter((f) => f.pack === pack);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPack(p.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-cute font-semibold transition",
              pack === p.id ? "brand-grad text-white shadow" : "bg-white/60 hover:bg-white"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[52vh] overflow-y-auto no-scrollbar pr-1">
        {list.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFrame(f.id);
              room?.broadcastConfig({ frameId: f.id });
            }}
            className="text-left"
          >
            <FrameThumb frame={f} active={frameId === f.id} />
            <div className="text-center text-[11px] mt-1 font-cute opacity-70">{f.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// room provider is optional in the home screen before joining
function useSafeRoom() {
  try {
    return useRoom();
  } catch {
    return null;
  }
}

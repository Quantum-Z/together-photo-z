"use client";
import { motion } from "framer-motion";
import { LAYOUTS } from "@/data/layouts";
import { useBooth } from "@/store/booth";
import { cn } from "@/lib/utils";

export function LayoutPicker() {
  const { layoutId, setLayout } = useBooth();
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {LAYOUTS.map((l) => (
        <motion.button
          key={l.id}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLayout(l.id)}
          className={cn(
            "glass rounded-2xl p-2.5 flex flex-col items-center gap-2",
            layoutId === l.id ? "ring-2 ring-pink-400" : ""
          )}
        >
          <div
            className="rounded-md bg-white/70 grid gap-[3px] p-1.5"
            style={{ aspectRatio: l.ratio, width: 42 }}
          >
            <MiniGrid id={l.id} />
          </div>
          <span className="text-[11px] font-cute font-semibold">{l.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

function MiniGrid({ id }: { id: string }) {
  const l = LAYOUTS.find((x) => x.id === id)!;
  const cols = new Set(l.slots.map((s) => Math.round(s.x * 100))).size;
  return (
    <div
      className="grid gap-[3px] w-full h-full"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {l.slots.map((_, i) => (
        <div key={i} className="brand-grad rounded-[3px] opacity-80" />
      ))}
    </div>
  );
}

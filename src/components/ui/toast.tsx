"use client";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: number; msg: string; kind: "info" | "success" | "error" };
type S = { items: Toast[]; push: (msg: string, kind?: Toast["kind"]) => void; drop: (id: number) => void };

export const useToast = create<S>((set) => ({
  items: [],
  push: (msg, kind = "info") => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items, { id, msg, kind }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 2800);
  },
  drop: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const toast = (msg: string, kind?: Toast["kind"]) => useToast.getState().push(msg, kind);

export function Toaster() {
  const { items, drop } = useToast();
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.9 }}
            onClick={() => drop(t.id)}
            className="glass pointer-events-auto rounded-2xl px-4 py-2.5 text-sm font-medium font-cute cursor-pointer"
            style={{
              color: t.kind === "error" ? "#c93a5b" : t.kind === "success" ? "#2f8a5b" : "var(--ink)",
            }}
          >
            {t.kind === "success" ? "✨ " : t.kind === "error" ? "⚠️ " : "💬 "}
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

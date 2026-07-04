"use client";
import { motion } from "framer-motion";

const EMO = ["💖", "✨", "🎉", "🌸", "💕", "⭐", "🎀", "💫"];

export function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const x = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const dur = 2.2 + Math.random() * 1.8;
        return (
          <motion.span
            key={i}
            initial={{ y: -40, x: `${x}vw`, opacity: 0, rotate: 0 }}
            animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
            className="absolute text-2xl"
          >
            {EMO[i % EMO.length]}
          </motion.span>
        );
      })}
    </div>
  );
}

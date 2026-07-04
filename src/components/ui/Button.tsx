"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sounds";
import { useBooth } from "@/store/booth";

type Variant = "primary" | "ghost" | "soft" | "outline";
type Props = HTMLMotionProps<"button"> & { variant?: Variant; full?: boolean };

const styles: Record<Variant, string> = {
  primary: "brand-grad text-white shadow-lg shadow-pink-300/40",
  soft: "bg-white/70 text-[var(--ink)] hover:bg-white",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-white/40",
  outline: "bg-transparent border border-[var(--border)] text-[var(--ink)] hover:bg-white/40",
};

export function Button({ variant = "primary", full, className, onClick, children, ...rest }: Props) {
  const sounds = useBooth((s) => s.settings.sounds);
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={(e) => {
        if (sounds) sfx.click();
        onClick?.(e);
      }}
      className={cn(
        "relative rounded-2xl px-5 py-3 font-cute font-semibold text-[15px] transition-colors select-none",
        styles[variant],
        full && "w-full",
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

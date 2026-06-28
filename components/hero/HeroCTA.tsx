"use client";

import { Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function HeroCTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coffee px-6 text-sm font-medium text-paper shadow-soft transition-colors hover:bg-bark focus:outline-none focus:ring-2 focus:ring-coffee/30 focus:ring-offset-2 focus:ring-offset-paper"
      type="button"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98, y: 1 }}
    >
      <Sparkles aria-hidden="true" size={17} strokeWidth={1.8} />
      ひとり時間をAIと探す
    </motion.button>
  );
}

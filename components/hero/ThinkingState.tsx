"use client";

import { motion, useReducedMotion } from "motion/react";

export function ThinkingState() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      className="mt-5 flex items-center justify-center gap-3 text-sm text-ink/62"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
      transition={{ duration: 0.36, ease: [0.4, 0, 0.2, 1] }}
    >
      <span>栞を作っています</span>
      <span className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            animate={shouldReduceMotion ? { opacity: 0.5 } : { opacity: [0.28, 0.9, 0.28], y: [0, -2, 0] }}
            className="h-1.5 w-1.5 rounded-full bg-coffee/55"
            key={dot}
            transition={{
              delay: dot * 0.18,
              duration: 1.25,
              ease: "easeInOut",
              repeat: shouldReduceMotion ? 0 : Infinity,
            }}
          />
        ))}
      </span>
    </motion.div>
  );
}

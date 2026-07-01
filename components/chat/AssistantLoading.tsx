"use client";

import { motion, useReducedMotion } from "motion/react";
import { assistantLoadingText } from "@/lib/mockChat";

export function AssistantLoading() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      className="flex items-center gap-3 text-sm text-ink/62"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.26, duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
    >
      <span>{assistantLoadingText}</span>
      <span aria-hidden="true" className="flex gap-1.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            animate={shouldReduceMotion ? { opacity: 0.55 } : { opacity: [0.3, 0.9, 0.3], scale: [1, 1.18, 1] }}
            className="h-1.5 w-1.5 rounded-full bg-seal/60"
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

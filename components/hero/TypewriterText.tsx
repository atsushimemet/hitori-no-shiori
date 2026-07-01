"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { promptExamples } from "@/lib/prompts";

type TypewriterTextProps = {
  text: string;
  promptIndex: number;
  isDeleting: boolean;
};

export function TypewriterText({ text, promptIndex, isDeleting }: TypewriterTextProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-[6.5rem] flex-col justify-between gap-5">
      <div>
        <p className="eyebrow mb-3">今日の気分を、そのまま</p>
        <AnimatePresence mode="wait">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[4.5rem] whitespace-pre-wrap text-base leading-8 text-ink sm:text-lg sm:leading-9"
            initial={{ opacity: shouldReduceMotion ? 0 : 1, y: shouldReduceMotion ? 4 : 0 }}
            key={shouldReduceMotion ? promptIndex : "typewriter-text"}
            transition={{ duration: shouldReduceMotion ? 0.32 : 0 }}
          >
            <span aria-live="polite">{text}</span>
            <motion.span
              animate={shouldReduceMotion ? { opacity: 0.35 } : { opacity: [0.2, 1, 0.2] }}
              aria-hidden="true"
              className="ml-1 inline-block h-5 w-px translate-y-1 bg-seal/80"
              transition={{
                duration: 1.05,
                ease: "easeInOut",
                repeat: shouldReduceMotion ? 0 : Infinity,
              }}
            />
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow">{isDeleting ? "次の気分へ" : "入力例"}</span>
        <span className="figure text-xs text-bark">
          {String(promptIndex + 1).padStart(2, "0")} / {String(promptExamples.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type PromptBoxProps = {
  children?: ReactNode;
};

export function PromptBox({ children }: PromptBoxProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.form
      animate={{
        opacity: 1,
        scale: !shouldReduceMotion && isFocused ? 1.005 : 1,
        y: !shouldReduceMotion && isFocused ? -3 : 0,
      }}
      className="group rounded-2xl border border-coffee/15 bg-white/82 p-3 text-left shadow-soft backdrop-blur transition-colors focus-within:border-coffee/30"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      onBlurCapture={() => setIsFocused(false)}
      onFocusCapture={() => setIsFocused(true)}
      transition={{ delay: shouldReduceMotion ? 0 : 0.12, duration: 0.46, ease: [0.4, 0, 0.2, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <button
        aria-label="入力例を確認する"
        className="min-h-44 w-full cursor-text rounded-xl border border-transparent bg-paper/45 px-5 py-5 text-left outline-none transition-colors group-focus-within:bg-white/70 sm:min-h-48 sm:px-7 sm:py-6"
        type="button"
      >
        {children}
      </button>
    </motion.form>
  );
}

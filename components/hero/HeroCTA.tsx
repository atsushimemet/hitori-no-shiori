"use client";

import { Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { PromptInteractionState } from "@/hooks/usePromptInteraction";

type HeroCTAProps = {
  state: PromptInteractionState;
  onClick: () => void;
};

const stateClasses: Record<PromptInteractionState, string> = {
  idle: "bg-coffee text-paper hover:bg-bark",
  intent: "bg-bark text-paper hover:bg-bark",
  focused: "bg-coffee text-paper hover:bg-bark",
  typing: "bg-navy text-paper hover:bg-navy/90",
  submitted: "bg-coffee/45 text-paper",
};

export function HeroCTA({ state, onClick }: HeroCTAProps) {
  const shouldReduceMotion = useReducedMotion();
  const isSubmitted = state === "submitted";

  return (
    <motion.button
      className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium shadow-soft transition-colors focus:outline-none focus:ring-2 focus:ring-coffee/30 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-default ${stateClasses[state]}`}
      disabled={isSubmitted}
      onClick={onClick}
      type="button"
      whileHover={shouldReduceMotion || isSubmitted ? undefined : { y: state === "typing" ? -3 : -2 }}
      whileTap={shouldReduceMotion || isSubmitted ? undefined : { scale: 0.98, y: 1 }}
    >
      <Sparkles aria-hidden="true" size={17} strokeWidth={1.8} />
      {isSubmitted ? "栞を準備中" : "ひとり時間をAIと探す"}
    </motion.button>
  );
}

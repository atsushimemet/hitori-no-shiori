"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type ChatMessageProps = {
  children: ReactNode;
  layoutId?: string;
  role: "assistant" | "user";
};

export function ChatMessage({ children, layoutId, role }: ChatMessageProps) {
  const shouldReduceMotion = useReducedMotion();
  const isUser = role === "user";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className={cn(
          "max-w-[82%] rounded-2xl px-5 py-4 text-left text-sm leading-7 shadow-soft sm:max-w-[68%] sm:text-base",
          isUser ? "rounded-tr-md bg-white text-ink" : "rounded-tl-md bg-paper/60 text-ink/72",
        )}
        layout
        layoutId={layoutId}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

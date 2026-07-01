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
          "relative max-w-[82%] rounded-card px-5 py-4 text-left text-sm leading-7 sm:max-w-[68%] sm:text-base",
          isUser
            ? "border border-line bg-cream text-ink shadow-plate"
            : "border border-line/60 bg-paper/50 pl-6 text-ink/80",
        )}
        layout
        layoutId={layoutId}
      >
        {!isUser ? (
          <span aria-hidden="true" className="ribbon absolute left-0 top-3 bottom-3 h-auto rounded-r-sm" />
        ) : null}
        {children}
      </motion.div>
    </motion.div>
  );
}

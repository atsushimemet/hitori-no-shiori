"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { PromptInteractionState } from "@/hooks/usePromptInteraction";

type PromptBoxProps = {
  children?: ReactNode;
  state: PromptInteractionState;
  value: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const stateStyles: Record<PromptInteractionState, string> = {
  idle: "border-coffee/15 bg-white/80",
  intent: "border-coffee/24 bg-white/90",
  focused: "border-coffee/35 bg-white/95",
  typing: "border-coffee/40 bg-white/95",
  submitted: "border-coffee/20 bg-white/90",
};

export function PromptBox({
  children,
  state,
  value,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onChange,
  onSubmit,
}: PromptBoxProps) {
  const shouldReduceMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInputMode = state === "focused" || state === "typing" || state === "submitted";
  const isSubmitted = state === "submitted";

  return (
    <motion.form
      animate={{
        opacity: 1,
        scale: !shouldReduceMotion && (state === "focused" || state === "typing") ? 1.005 : 1,
        y: !shouldReduceMotion && state === "submitted" ? -4 : state === "intent" ? -2 : 0,
      }}
      className={`group rounded-2xl border p-3 text-left shadow-soft backdrop-blur transition-colors focus-within:ring-2 focus-within:ring-coffee/20 ${stateStyles[state]}`}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onSubmit={onSubmit}
      transition={{ delay: shouldReduceMotion ? 0 : 0.12, duration: 0.46, ease: [0.4, 0, 0.2, 1] }}
      whileHover={shouldReduceMotion || isSubmitted ? undefined : { y: -2 }}
    >
      <div
        className="relative min-h-44 w-full cursor-text rounded-xl border border-transparent bg-paper/45 px-5 py-5 transition-colors group-focus-within:bg-white/75 sm:min-h-48 sm:px-7 sm:py-6"
        onClick={() => textareaRef.current?.focus()}
      >
        <motion.div
          animate={{ opacity: isInputMode ? 0 : 1, y: isInputMode ? -4 : 0 }}
          aria-hidden={isInputMode}
          className="pointer-events-none"
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>

        <motion.textarea
          animate={{ opacity: isInputMode ? 1 : 0, y: isInputMode ? 0 : 4 }}
          aria-label="今日のひとり時間の希望"
          className="absolute inset-0 min-h-full w-full resize-none rounded-xl bg-transparent px-5 py-5 text-base leading-8 text-ink outline-none placeholder:text-ink/38 disabled:cursor-default sm:px-7 sm:py-6 sm:text-lg sm:leading-9"
          disabled={isSubmitted}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="今日は、どんなひとり時間にしますか？"
          ref={textareaRef}
          rows={4}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          value={value}
        />
      </div>
    </motion.form>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";

type BookmarkIntroProps = {
  onComplete?: () => void;
};

const lineTransition = {
  duration: 0.36,
  ease: [0.4, 0, 0.2, 1],
} as const;

const paths = [
  "M24 13.5H40",
  "M40 13.5V46",
  "M40 46L32 39",
  "M32 39L24 46",
  "M24 46V13.5",
  "M28.5 20H35.5",
] as const;

export function BookmarkIntro({ onComplete }: BookmarkIntroProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        className="flex h-20 w-20 items-center justify-center"
        initial={{ opacity: 0 }}
        onAnimationComplete={onComplete}
        transition={{ duration: 0.65, ease: "easeInOut", times: [0, 0.55, 1] }}
      >
        <svg
          aria-hidden="true"
          className="h-16 w-16 text-coffee"
          fill="none"
          viewBox="0 0 64 64"
        >
          <path
            d="M24 13.5H40V46L32 39L24 46V13.5Z"
            fill="rgb(var(--color-paper) / 0.72)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{
        filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(12px)"],
        opacity: [1, 1, 1, 0],
        scale: [1, 1, 1.035, 1, 1.18],
      }}
      className="flex h-24 w-24 items-center justify-center text-coffee"
      initial={{ opacity: 1, scale: 1 }}
      onAnimationComplete={onComplete}
      transition={{
        duration: 2.35,
        ease: [0.4, 0, 0.2, 1],
        times: [0, 0.66, 0.75, 0.84, 1],
      }}
    >
      <svg
        aria-hidden="true"
        className="h-20 w-20 overflow-visible"
        fill="none"
        viewBox="0 0 64 64"
      >
        <motion.path
          animate={{ opacity: 1, scale: 1 }}
          d="M24 13.5H40V46L32 39L24 46V13.5Z"
          fill="rgb(var(--color-paper) / 0.78)"
          initial={{ opacity: 0, scale: 0.98 }}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          transition={{
            delay: 1.12,
            duration: 0.46,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        <motion.path
          animate={{ opacity: [0, 0, 0.24] }}
          d="M24 13.5H40V46L32 39L24 46V13.5Z"
          fill="rgb(var(--color-coffee) / 0.24)"
          initial={{ opacity: 0 }}
          stroke="none"
          transition={{ delay: 1.28, duration: 0.42, ease: "easeOut" }}
        />
        {paths.map((path, index) => (
          <motion.path
            animate={{ opacity: 1, pathLength: 1 }}
            d={path}
            initial={{ opacity: 0, pathLength: 0 }}
            key={path}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            transition={{
              ...lineTransition,
              delay: 0.12 + index * 0.16,
            }}
          />
        ))}
        <motion.path
          animate={{ opacity: [0, 0.35, 0] }}
          d="M22 12H42"
          initial={{ opacity: 0 }}
          stroke="rgb(var(--color-bark) / 0.5)"
          strokeLinecap="round"
          strokeWidth="1.25"
          transition={{ delay: 1.12, duration: 0.52, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

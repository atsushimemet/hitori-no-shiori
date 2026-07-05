"use client";

import { motion, useReducedMotion } from "motion/react";

type PlaceRouteLoadingProps = {
  className?: string;
};

const bookmarkPaths = [
  "M24 13.5H40",
  "M40 13.5V46",
  "M40 46L32 39",
  "M32 39L24 46",
  "M24 46V13.5",
  "M28.5 20H35.5",
] as const;

export function PlaceRouteLoading({ className = "" }: PlaceRouteLoadingProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-live="polite"
      className={`fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-paper/92 px-[var(--space-page-x)] backdrop-blur-sm ${className}`}
      exit={{ opacity: 0, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } }}
      initial={{ opacity: 0 }}
      role="status"
      transition={{ duration: shouldReduceMotion ? 0.12 : 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <div className="relative flex h-32 w-28 items-center justify-center">
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.34 }
                : {
                    opacity: [0.24, 0.36, 0.24],
                    rotateY: [0, -58, -72],
                    x: [0, -10, -18],
                  }
            }
            className="absolute inset-y-4 left-8 w-16 rounded-r-[2px] border border-line bg-cream shadow-plate"
            initial={{ opacity: 0.3, rotateY: 0, x: 0 }}
            style={{ transformOrigin: "left center" }}
            transition={{
              duration: 1.65,
              ease: [0.22, 1, 0.36, 1],
              repeat: shouldReduceMotion ? 0 : Infinity,
              repeatType: "mirror",
            }}
          />
          <motion.div
            animate={shouldReduceMotion ? { opacity: 0.5 } : { opacity: [0.28, 0.54, 0.28], scaleY: [0.92, 1, 0.92] }}
            className="absolute left-8 top-4 h-24 w-px bg-line"
            transition={{ duration: 1.65, ease: "easeInOut", repeat: shouldReduceMotion ? 0 : Infinity }}
          />
          <motion.svg
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.84, 1, 0.84], y: [2, -2, 2] }}
            aria-hidden="true"
            className="relative h-20 w-20 overflow-visible text-coffee"
            fill="none"
            viewBox="0 0 64 64"
            transition={{ duration: 1.65, ease: "easeInOut", repeat: shouldReduceMotion ? 0 : Infinity }}
          >
            <motion.path
              animate={{ opacity: shouldReduceMotion ? 0.78 : [0.58, 0.82, 0.58] }}
              d="M24 13.5H40V46L32 39L24 46V13.5Z"
              fill="rgb(var(--color-paper) / 0.78)"
              stroke="none"
              transition={{ duration: 1.65, ease: "easeInOut", repeat: shouldReduceMotion ? 0 : Infinity }}
            />
            {bookmarkPaths.map((path, index) => (
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
                  delay: shouldReduceMotion ? 0 : index * 0.11,
                  duration: shouldReduceMotion ? 0.01 : 0.34,
                  ease: [0.4, 0, 0.2, 1],
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  repeatDelay: 0.95,
                }}
              />
            ))}
          </motion.svg>
        </div>
        <p className="mt-3 font-serif text-2xl font-medium leading-tight text-coffee">今日の栞を開いています</p>
      </div>
    </motion.div>
  );
}

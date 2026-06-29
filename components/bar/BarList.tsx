"use client";

import { motion, useReducedMotion } from "motion/react";
import { BarCard } from "@/components/bar/BarCard";
import { choreo } from "@/components/motion/tokens";
import { mockBars } from "@/lib/mockBars";

export function BarList() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid gap-5"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : choreo.stagger,
            delayChildren: shouldReduceMotion ? 0 : choreo.delayChildren,
          },
        },
      }}
    >
      {mockBars.slice(0, 3).map((bar) => (
        <BarCard bar={bar} key={bar.name} />
      ))}
    </motion.div>
  );
}

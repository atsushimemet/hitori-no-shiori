"use client";

import { motion, useReducedMotion } from "motion/react";
import { BarList } from "@/components/bar/BarList";
import { choreo, duration, ease } from "@/components/motion/tokens";

export function CasualBarView() {
  const shouldReduceMotion = useReducedMotion();
  const pageVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 12, filter: "blur(8px)" },
    show: shouldReduceMotion
      ? { opacity: 1, transition: { duration: duration.micro, ease: ease.gentle } }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: duration.page,
            ease: ease.soft,
          },
        },
  };
  const headingVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? duration.micro : duration.head,
        ease: ease.soft,
      },
    },
  };

  return (
    <motion.main
      animate="show"
      className="min-h-screen px-[var(--space-page-x)] py-[var(--space-page-y)]"
      initial="hidden"
      variants={pageVariants}
    >
      <section className="mx-auto max-w-5xl">
        <motion.div
          className="mb-10 max-w-2xl"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                delayChildren: choreo.delayChildren,
                staggerChildren: shouldReduceMotion ? 0 : choreo.headingStagger,
              },
            },
          }}
        >
          <p className="text-sm font-medium text-bark/70">今日のひとり時間の栞</p>
          <motion.h1
            className="mt-3 font-serif text-4xl font-semibold tracking-normal text-ink sm:text-5xl"
            variants={headingVariants}
          >
            今日のひとり時間に合いそうなバーを選びました。
          </motion.h1>
          <motion.p className="mt-5 text-base leading-8 text-ink/70" variants={headingVariants}>
            恵比寿で静かに過ごせる場所を3件に絞っています。
          </motion.p>
        </motion.div>
        <BarList />
      </section>
    </motion.main>
  );
}

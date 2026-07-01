"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { KissaFollowupFlow } from "@/components/kissa/KissaFollowupFlow";
import { KissaList } from "@/components/kissa/KissaList";
import { choreo, duration, ease } from "@/components/motion/tokens";
import { mockKissas } from "@/lib/mockKissas";

const junKissaTheme: CSSProperties = {
  ["--shiori-cream" as string]: "#fbf6ed",
  ["--shiori-paper" as string]: "#f5efe4",
  ["--shiori-ink" as string]: "#4a3729",
  ["--shiori-ink-soft" as string]: "#8a725c",
  ["--shiori-accent" as string]: "#b24a37",
  ["--shiori-line" as string]: "#d6cab7",
};

export function JunKissaView() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showFollowup, setShowFollowup] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const kissas = mockKissas.slice(0, 3);

  const handleViewedAll = useCallback(() => {
    setShowFollowup(true);
  }, []);

  const handleReviewCandidates = useCallback(() => {
    carouselRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });
  }, [shouldReduceMotion]);

  const handleRestartConversation = useCallback(() => {
    router.push("/");
  }, [router]);

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
      style={junKissaTheme}
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
          <motion.div className="flex items-center gap-3" variants={headingVariants}>
            <span className="ribbon h-4" />
            <span className="eyebrow text-seal">今日の栞 — 純喫茶</span>
          </motion.div>
          <motion.h1
            className="mt-4 font-serif text-4xl font-medium leading-[1.14] tracking-[0.02em] text-coffee sm:text-5xl"
            variants={headingVariants}
          >
            今日のひとり時間に、
            <br className="hidden sm:block" />
            合いそうな喫茶店を三軒。
          </motion.h1>
          <motion.p className="mt-5 max-w-md text-base leading-8 text-bark" variants={headingVariants}>
            銀座で、静かに過ごせる場所を選びました。
          </motion.p>
          <motion.div className="hairline mt-8" variants={headingVariants} />
        </motion.div>
        <div ref={carouselRef}>
          <KissaList onViewedAll={handleViewedAll} />
        </div>
        <AnimatePresence>
          {showFollowup ? (
            <KissaFollowupFlow
              kissas={kissas}
              onRestartConversation={handleRestartConversation}
              onReviewCandidates={handleReviewCandidates}
            />
          ) : null}
        </AnimatePresence>
      </section>
    </motion.main>
  );
}

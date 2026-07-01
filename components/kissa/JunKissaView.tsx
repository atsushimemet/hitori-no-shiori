"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { KissaFollowupFlow } from "@/components/kissa/KissaFollowupFlow";
import { KissaList } from "@/components/kissa/KissaList";
import { choreo, duration, ease } from "@/components/motion/tokens";
import { mockKissas } from "@/lib/mockKissas";

const junKissaTheme: CSSProperties = {
  ["--shiori-cream" as string]: "#f7f3ea",
  ["--shiori-paper" as string]: "#fbfaf6",
  ["--shiori-ink" as string]: "#2b2926",
  ["--shiori-ink-soft" as string]: "#7d624b",
  ["--shiori-accent" as string]: "#5b4330",
  ["--shiori-line" as string]: "#dfd6c8",
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
          <p className="text-sm font-medium text-bark/70">今日のひとり時間の栞</p>
          <motion.h1
            className="mt-3 font-serif text-4xl font-semibold tracking-normal text-ink sm:text-5xl"
            variants={headingVariants}
          >
            今日のひとり時間に合いそうな喫茶店を選びました。
          </motion.h1>
          <motion.p className="mt-5 text-base leading-8 text-ink/70" variants={headingVariants}>
            銀座で静かに過ごせる場所を3件に絞っています。
          </motion.p>
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

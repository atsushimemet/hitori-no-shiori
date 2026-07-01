"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { CarouselShell } from "@/components/carousel/CarouselShell";
import { KissaCard } from "@/components/kissa/KissaCard";
import { useCarousel } from "@/hooks/useCarousel";
import { mockKissas } from "@/lib/mockKissas";

const turnVariants: Variants = {
  enter: (direction: number) => ({ rotateY: direction > 0 ? -90 : 90, opacity: 0.15 }),
  center: { rotateY: 0, opacity: 1 },
  exit: (direction: number) => ({ rotateY: direction > 0 ? 90 : -90, opacity: 0.15 }),
};

const turnTransition = { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const };

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const fadeTransition = { duration: 0.3, ease: "easeInOut" as const };

type KissaListProps = {
  onViewedAll?: () => void;
};

export function KissaList({ onViewedAll }: KissaListProps) {
  const shouldReduceMotion = useReducedMotion();
  const kissas = mockKissas.slice(0, 3);
  const api = useCarousel({ count: kissas.length, autoPlayMs: 5500 });
  const viewedIndexesRef = useRef(new Set([0]));
  const [hasViewedAll, setHasViewedAll] = useState(kissas.length <= 1);
  const kissa = kissas[api.index];
  const variants = shouldReduceMotion ? fadeVariants : turnVariants;
  const transition = shouldReduceMotion ? fadeTransition : turnTransition;
  const origin = api.direction > 0 ? "left center" : "right center";

  useEffect(() => {
    viewedIndexesRef.current.add(api.index);
    if (viewedIndexesRef.current.size >= kissas.length) {
      setHasViewedAll(true);
    }
  }, [api.index, kissas.length]);

  useEffect(() => {
    if (hasViewedAll) {
      onViewedAll?.();
    }
  }, [hasViewedAll, onViewedAll]);

  return (
    <CarouselShell
      api={api}
      count={kissas.length}
      aspectClassName="min-h-[28rem] sm:min-h-[26rem]"
      className="items-start"
      viewportClassName="max-w-3xl"
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <AnimatePresence custom={api.direction} initial={false} mode="popLayout">
          <motion.div
            animate="center"
            className="absolute inset-0"
            custom={api.direction}
            exit="exit"
            initial="enter"
            key={kissa.name}
            style={{
              backfaceVisibility: "hidden",
              transformOrigin: shouldReduceMotion ? "center center" : origin,
            }}
            transition={transition}
            variants={variants}
          >
            <KissaCard className="h-full" index={api.index} kissa={kissa} reveal={!shouldReduceMotion} total={kissas.length} />
          </motion.div>
        </AnimatePresence>
      </div>
    </CarouselShell>
  );
}

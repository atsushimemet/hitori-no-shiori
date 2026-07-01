"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { BarCard } from "@/components/bar/BarCard";
import { CarouselShell } from "@/components/carousel/CarouselShell";
import { useCarousel } from "@/hooks/useCarousel";
import { mockBars } from "@/lib/mockBars";

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

type BarListProps = {
  onViewedAll?: () => void;
};

export function BarList({ onViewedAll }: BarListProps) {
  const shouldReduceMotion = useReducedMotion();
  const bars = mockBars.slice(0, 3);
  const api = useCarousel({ count: bars.length, autoPlayMs: 5500 });
  const viewedIndexesRef = useRef(new Set([0]));
  const [hasViewedAll, setHasViewedAll] = useState(bars.length <= 1);
  const bar = bars[api.index];
  const variants = shouldReduceMotion ? fadeVariants : turnVariants;
  const transition = shouldReduceMotion ? fadeTransition : turnTransition;
  const origin = api.direction > 0 ? "left center" : "right center";

  useEffect(() => {
    viewedIndexesRef.current.add(api.index);
    if (viewedIndexesRef.current.size >= bars.length) {
      setHasViewedAll(true);
    }
  }, [api.index, bars.length]);

  useEffect(() => {
    if (hasViewedAll) {
      onViewedAll?.();
    }
  }, [hasViewedAll, onViewedAll]);

  return (
    <CarouselShell
      api={api}
      count={bars.length}
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
            key={bar.name}
            style={{
              backfaceVisibility: "hidden",
              transformOrigin: shouldReduceMotion ? "center center" : origin,
            }}
            transition={transition}
            variants={variants}
          >
            <BarCard bar={bar} className="h-full" index={api.index} reveal={!shouldReduceMotion} total={bars.length} />
          </motion.div>
        </AnimatePresence>
      </div>
    </CarouselShell>
  );
}

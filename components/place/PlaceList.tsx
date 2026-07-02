"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { CarouselShell } from "@/components/carousel/CarouselShell";
import { PlaceCard } from "@/components/place/PlaceCard";
import { useCarousel } from "@/hooks/useCarousel";
import type { Place } from "@/lib/placeCategories";

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

type PlaceListProps = {
  onViewedAll?: () => void;
  places: Place[];
};

export function PlaceList({ onViewedAll, places }: PlaceListProps) {
  const shouldReduceMotion = useReducedMotion();
  const displayPlaces = places.slice(0, 3);
  const api = useCarousel({ count: displayPlaces.length, autoPlayMs: 5500 });
  const viewedIndexesRef = useRef(new Set([0]));
  const [hasViewedAll, setHasViewedAll] = useState(displayPlaces.length <= 1);
  const place = displayPlaces[api.index];
  const variants = shouldReduceMotion ? fadeVariants : turnVariants;
  const transition = shouldReduceMotion ? fadeTransition : turnTransition;
  const origin = api.direction > 0 ? "left center" : "right center";

  useEffect(() => {
    viewedIndexesRef.current.add(api.index);
    if (viewedIndexesRef.current.size >= displayPlaces.length) {
      setHasViewedAll(true);
    }
  }, [api.index, displayPlaces.length]);

  useEffect(() => {
    if (hasViewedAll) {
      onViewedAll?.();
    }
  }, [hasViewedAll, onViewedAll]);

  if (!place) {
    return null;
  }

  return (
    <CarouselShell
      api={api}
      count={displayPlaces.length}
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
            key={place.name}
            style={{
              backfaceVisibility: "hidden",
              transformOrigin: shouldReduceMotion ? "center center" : origin,
            }}
            transition={transition}
            variants={variants}
          >
            <PlaceCard
              className="h-full"
              index={api.index}
              place={place}
              reveal={!shouldReduceMotion}
              total={displayPlaces.length}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </CarouselShell>
  );
}

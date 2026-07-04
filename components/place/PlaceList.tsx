"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { CarouselShell } from "@/components/carousel/CarouselShell";
import { PlaceCard } from "@/components/place/PlaceCard";
import { useCarousel } from "@/hooks/useCarousel";
import type { Place, PlaceAttributeDefinition } from "@/lib/placeCategories";

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
  attributeSchema?: PlaceAttributeDefinition[];
  onViewedAll?: () => void;
  places: Place[];
};

export function PlaceList({ attributeSchema = [], onViewedAll, places }: PlaceListProps) {
  const shouldReduceMotion = useReducedMotion();
  const displayPlaces = places.slice(0, 3);
  const api = useCarousel({ count: displayPlaces.length, autoPlayMs: 5500 });
  const activeCardRef = useRef<HTMLDivElement>(null);
  const viewedIndexesRef = useRef(new Set([0]));
  const [hasViewedAll, setHasViewedAll] = useState(displayPlaces.length <= 1);
  const [activeCardHeight, setActiveCardHeight] = useState<number | null>(null);
  const place = displayPlaces[api.index];
  const variants = shouldReduceMotion ? fadeVariants : turnVariants;
  const transition = shouldReduceMotion ? fadeTransition : turnTransition;
  const origin = api.direction > 0 ? "left center" : "right center";

  useEffect(() => {
    viewedIndexesRef.current.add(api.index);
    if (displayPlaces.length > 0 && viewedIndexesRef.current.size >= displayPlaces.length) {
      setHasViewedAll(true);
    }
  }, [api.index, displayPlaces.length]);

  useEffect(() => {
    if (hasViewedAll) {
      onViewedAll?.();
    }
  }, [hasViewedAll, onViewedAll]);

  useEffect(() => {
    const element = activeCardRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      setActiveCardHeight(element.scrollHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [api.index, place?.name]);

  if (!place) {
    return (
      <div className="max-w-3xl rounded-card border border-line bg-cream p-8 text-left shadow-plate">
        <p className="font-serif text-2xl font-medium text-coffee">まだ表示できる店舗がありません。</p>
        <p className="mt-3 text-sm leading-7 text-ink/66">
          Supabaseで公開済みの店舗を登録すると、ここに候補が表示されます。
        </p>
      </div>
    );
  }

  return (
    <CarouselShell
      api={api}
      count={displayPlaces.length}
      aspectClassName="min-h-[28rem] transition-[height] duration-300 ease-in-out sm:min-h-[26rem]"
      className="items-start"
      viewportClassName="max-w-3xl"
      viewportStyle={activeCardHeight ? { height: activeCardHeight } : undefined}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <AnimatePresence custom={api.direction} initial={false} mode="popLayout">
          <motion.div
            animate="center"
            className="absolute inset-x-0 top-0"
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
            <div ref={activeCardRef}>
              <PlaceCard
                attributeSchema={attributeSchema}
                className="min-h-[28rem] sm:min-h-[26rem]"
                index={api.index}
                place={place}
                reveal={!shouldReduceMotion}
                total={displayPlaces.length}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </CarouselShell>
  );
}

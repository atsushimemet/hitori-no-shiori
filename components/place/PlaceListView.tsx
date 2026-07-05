"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { choreo, duration, ease } from "@/components/motion/tokens";
import { PlaceFollowupFlow } from "@/components/place/PlaceFollowupFlow";
import { PlaceList } from "@/components/place/PlaceList";
import { readChatSession } from "@/lib/chatSession";
import type { PlaceCategoryConfig } from "@/lib/placeCategories";

const placeTheme: CSSProperties = {
  ["--shiori-cream" as string]: "#fbf6ed",
  ["--shiori-paper" as string]: "#f5efe4",
  ["--shiori-ink" as string]: "#4a3729",
  ["--shiori-ink-soft" as string]: "#8a725c",
  ["--shiori-accent" as string]: "#b24a37",
  ["--shiori-line" as string]: "#d6cab7",
};

type PlaceListViewProps = {
  category: PlaceCategoryConfig;
  requestedStation?: string;
};

function subscribeToChatSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}

function getSelectedStationNameForRoute(route: string) {
  const session = readChatSession();
  const stationName = session?.recommendationRoute === route ? session.selectedStationName?.trim() : "";

  return stationName || null;
}

export function PlaceListView({ category, requestedStation }: PlaceListViewProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showFollowup, setShowFollowup] = useState(false);
  const selectedStationName = useSyncExternalStore(
    subscribeToChatSession,
    () => getSelectedStationNameForRoute(category.route),
    () => null,
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  // /chat から遷移した際にスクロール位置が引き継がれると、固定ヘッダーと見出しが
  // 重なってしまうため、マウント時にページ先頭へ戻す。
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const places = category.places.slice(0, 3);
  const displayStation = requestedStation?.trim() || selectedStationName;
  const description = displayStation
    ? `${displayStation}で、静かに過ごせる場所を選びました。`
    : "駅名を指定してチャットから探すと、候補の店舗が表示されます。";

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
      style={placeTheme}
      variants={pageVariants}
    >
      <section className="mx-auto max-w-5xl">
        <motion.div
          animate="show"
          className="mb-10 max-w-2xl"
          initial="hidden"
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
            <span className="eyebrow text-seal">今日の栞 — {category.label}</span>
          </motion.div>
          <motion.h1
            className="mt-4 font-serif text-4xl font-medium leading-[1.14] tracking-[0.02em] text-coffee sm:text-5xl"
            variants={headingVariants}
          >
            {category.heading.split("\n").map((line, index, lines) => (
              <span key={line}>
                {line}
                {index < lines.length - 1 ? <br className="hidden sm:block" /> : null}
              </span>
            ))}
          </motion.h1>
          <motion.p className="mt-5 max-w-md text-base leading-8 text-bark" variants={headingVariants}>
            {description}
          </motion.p>
          <motion.div className="hairline mt-8" variants={headingVariants} />
        </motion.div>
        <div ref={carouselRef}>
          {places.length > 0 ? (
            <PlaceList attributeSchema={category.attributeSchema} onViewedAll={handleViewedAll} places={places} />
          ) : (
            <div className="max-w-3xl rounded-card border border-line bg-cream p-8 text-left shadow-plate">
              <p className="font-serif text-2xl font-medium text-coffee">表示できる店舗がありません。</p>
              <p className="mt-3 text-sm leading-7 text-ink/66">
                駅名と行きたい店舗の種類をチャットで指定すると、条件に合う店舗ページを表示します。
              </p>
            </div>
          )}
        </div>
        <AnimatePresence>
          {places.length > 0 && showFollowup ? (
            <PlaceFollowupFlow
              category={category}
              onRestartConversation={handleRestartConversation}
              onReviewCandidates={handleReviewCandidates}
              places={places}
            />
          ) : null}
        </AnimatePresence>
      </section>
    </motion.main>
  );
}

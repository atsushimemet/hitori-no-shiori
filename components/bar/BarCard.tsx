"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease } from "@/components/motion/tokens";
import { cn } from "@/lib/cn";
import type { MockBar } from "@/lib/mockBars";

type BarCardProps = {
  bar: MockBar;
  className?: string;
  index?: number;
  total?: number;
  reveal?: boolean;
};

export function BarCard({ bar, className, index, total, reveal = true }: BarCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const cardVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" },
    show: shouldReduceMotion
      ? {
          opacity: 1,
          transition: { duration: duration.micro, ease: ease.gentle },
        }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: duration.card, ease: ease.soft },
        },
  };
  const lineVariants = {
    hidden: { opacity: 0, scaleX: 0 },
    show: {
      opacity: 1,
      scaleX: 1,
      transition: {
        delay: shouldReduceMotion ? 0 : duration.micro,
        duration: duration.micro,
        ease: ease.gentle,
      },
    },
  };
  const tagVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : duration.micro * 2,
        duration: duration.micro,
        ease: ease.gentle,
      },
    },
  };

  return (
    <motion.article
      animate="show"
      className={cn(
        "relative overflow-hidden rounded-card border border-line bg-cream p-6 text-left shadow-plate transition-colors hover:border-bark/40 sm:p-8",
        className,
      )}
      initial={reveal ? "hidden" : "show"}
      transition={{ duration: duration.micro, ease: ease.gentle }}
      variants={cardVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -4, boxShadow: "var(--shadow-lift)" }}
    >
      {/* 栞リボン */}
      <span aria-hidden="true" className="ribbon absolute left-8 top-0 h-5" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {typeof index === "number" ? (
            <span className="figure text-xs text-seal">
              {String(index + 1).padStart(2, "0")}
              {typeof total === "number" ? ` / ${String(total).padStart(2, "0")}` : null}
            </span>
          ) : null}
          <h2 className="mt-2 font-serif text-2xl font-medium tracking-[0.02em] text-coffee sm:text-3xl">
            {bar.name}
          </h2>
          <p className="mt-2 text-sm text-bark">
            {bar.station}｜徒歩{bar.walkMinutes}分
          </p>
        </div>
        <motion.span
          className="shrink-0 rounded-control border border-line bg-paper px-3 py-1 text-xs tracking-[0.08em] text-coffee"
          variants={tagVariants}
        >
          {bar.atmosphere}
        </motion.span>
      </div>

      <motion.div className="mt-6 h-px origin-left bg-line" variants={lineVariants} />

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="eyebrow">席・空間</dt>
          <dd className="mt-2 text-sm leading-7 text-ink/80">
            全{bar.totalSeats}席
            <span className="text-bark">
              （カウンター{bar.counterSeats}・テーブル{bar.tableSeats}）
            </span>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">読みもの・SNS</dt>
          <dd className="mt-2 text-sm leading-7 text-ink/80">
            {bar.recommendedArticle}
            <span className="mt-0.5 block text-bark">Instagram</span>
          </dd>
        </div>
      </dl>

      <motion.a
        className="group mt-7 inline-flex items-center gap-1.5 text-sm font-medium tracking-[0.04em] text-seal transition-colors hover:text-seal-deep"
        href={bar.mapUrl}
        rel="noreferrer"
        target="_blank"
        whileHover="hover"
      >
        <span>Google Map で開く</span>
        <motion.span
          aria-hidden="true"
          className="inline-flex"
          transition={{ duration: duration.micro, ease: ease.gentle }}
          variants={{ hover: shouldReduceMotion ? { opacity: 1 } : { x: 2, y: -2, opacity: 1 } }}
        >
          <ArrowUpRight size={15} strokeWidth={1.8} />
        </motion.span>
      </motion.a>
    </motion.article>
  );
}

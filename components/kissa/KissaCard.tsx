"use client";

import { ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease } from "@/components/motion/tokens";
import { cn } from "@/lib/cn";
import type { MockKissa } from "@/lib/mockKissas";

type KissaCardProps = {
  className?: string;
  kissa: MockKissa;
  reveal?: boolean;
};

export function KissaCard({ className, kissa, reveal = true }: KissaCardProps) {
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
        "rounded-lg border border-coffee/12 bg-white/80 p-5 text-left shadow-soft backdrop-blur transition-colors hover:border-coffee/20 sm:p-6",
        className,
      )}
      initial={reveal ? "hidden" : "show"}
      transition={{ duration: duration.micro, ease: ease.gentle }}
      variants={cardVariants}
      whileHover={
        shouldReduceMotion
          ? { boxShadow: "0 24px 80px rgb(61 47 37 / 0.14)" }
          : { y: -4, scale: 1.01, boxShadow: "0 24px 80px rgb(61 47 37 / 0.14)" }
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">{kissa.name}</h2>
          <p className="mt-2 text-sm text-ink/62">
            最寄り駅：{kissa.station}（徒歩{kissa.walkMinutes}分）
          </p>
        </div>
        <motion.span
          className="rounded-full border border-coffee/12 bg-paper/70 px-3 py-1 text-xs text-coffee"
          variants={tagVariants}
        >
          {kissa.atmosphere}
        </motion.span>
      </div>

      <motion.a
        className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy transition-colors hover:text-coffee"
        href={kissa.mapUrl}
        rel="noreferrer"
        target="_blank"
        whileHover="hover"
      >
        <span>Google Mapで開く</span>
        <motion.span
          aria-hidden="true"
          className="inline-flex"
          transition={{ duration: duration.micro, ease: ease.gentle }}
          variants={{
            hover: shouldReduceMotion ? { opacity: 1 } : { x: 2, y: -2, opacity: 1 },
          }}
        >
          <ExternalLink size={14} strokeWidth={1.8} />
        </motion.span>
      </motion.a>

      <div className="mt-6 pt-5">
        <motion.div className="mb-5 h-px origin-left bg-coffee/10" variants={lineVariants} />
        <p className="text-xs font-medium text-bark/70">席・空間</p>
        <p className="mt-2 text-sm leading-7 text-ink/72">
          {kissa.totalSeats}席（テーブル{kissa.tableSeats}席, カウンター{kissa.counterSeats}席）
        </p>
      </div>

      <div className="mt-5 pt-5">
        <motion.div className="mb-5 h-px origin-left bg-coffee/10" variants={lineVariants} />
        <p className="text-xs font-medium text-bark/70">おすすめ記事 / SNS</p>
        <div className="mt-2 space-y-1 text-sm leading-6 text-ink/72">
          <p>{kissa.recommendedArticle}</p>
          <p>Instagram</p>
        </div>
      </div>
    </motion.article>
  );
}

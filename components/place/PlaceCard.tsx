"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { duration, ease } from "@/components/motion/tokens";
import { cn } from "@/lib/cn";
import { orderPaymentMethods } from "@/lib/paymentMethods";
import type { Place, PlaceAttributeDefinition } from "@/lib/placeCategories";

type PlaceCardProps = {
  attributeSchema?: PlaceAttributeDefinition[];
  className?: string;
  index?: number;
  place: Place;
  reveal?: boolean;
  total?: number;
};

function getSeatInfo(place: Place) {
  if (place.seatInfo) {
    return place.seatInfo;
  }

  if (typeof place.totalSeats === "number") {
    const details = [
      typeof place.counterSeats === "number" ? `カウンター${place.counterSeats}` : null,
      typeof place.tableSeats === "number" ? `テーブル${place.tableSeats}` : null,
    ].filter(Boolean);

    return `全${place.totalSeats}席${details.length > 0 ? `（${details.join("・")}）` : ""}`;
  }

  return "席情報は確認中";
}

export function PlaceCard({ attributeSchema = [], className, index, place, reveal = true, total }: PlaceCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const googleMapUrl = place.googleMapUrl ?? place.mapUrl ?? "#";
  const attributes = attributeSchema
    .map((definition) => ({
      ...definition,
      value: place.attributes?.[definition.key],
    }))
    .filter((attribute) => attribute.value);
  const paymentMethods = orderPaymentMethods(place.paymentMethods ?? []);
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

  return (
    <motion.article
      animate="show"
      className={cn(
        "relative max-w-full overflow-hidden rounded-card border border-line bg-cream p-4 text-left shadow-plate transition-colors hover:border-bark/40 sm:p-6 md:p-8",
        className,
      )}
      initial={reveal ? "hidden" : "show"}
      transition={{ duration: duration.micro, ease: ease.gentle }}
      variants={cardVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -4, boxShadow: "var(--shadow-lift)" }}
    >
      <span aria-hidden="true" className="ribbon absolute left-4 top-0 h-5 sm:left-8" />

      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {typeof index === "number" ? (
            <span className="figure text-xs text-seal">
              {String(index + 1).padStart(2, "0")}
              {typeof total === "number" ? ` / ${String(total).padStart(2, "0")}` : null}
            </span>
          ) : null}
          <h2 className="mt-2 break-words font-serif text-xl font-medium tracking-[0.02em] text-coffee sm:text-2xl md:text-3xl">
            {place.name}
          </h2>
          <p className="mt-2 break-words text-sm text-bark">
            {place.station}｜徒歩{place.walkMinutes}分
          </p>
        </div>
      </div>

      <motion.div className="mt-6 h-px origin-left bg-line" variants={lineVariants} />

      <dl className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
        <div className="min-w-0">
          <dt className="eyebrow">席情報</dt>
          <dd className="mt-2 break-words text-sm leading-7 text-ink/80">
            {getSeatInfo(place)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="eyebrow">読みもの・SNS</dt>
          <dd className="mt-2 break-words text-sm leading-7 text-ink/80">
            {place.recommendedArticleUrl ? (
              <a
                className="break-all text-bark transition-colors hover:text-seal"
                href={place.recommendedArticleUrl}
                rel="noreferrer"
                target="_blank"
              >
                {place.recommendedArticle}
              </a>
            ) : (
              place.recommendedArticle
            )}
            {place.instagramUrl ? (
              <a
                className="mt-0.5 block text-bark transition-colors hover:text-seal"
                href={place.instagramUrl}
                rel="noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            ) : null}
          </dd>
        </div>
        {attributes.map((attribute) => (
          <div className="min-w-0" key={attribute.key}>
            <dt className="eyebrow">{attribute.label}</dt>
            <dd className="mt-2 break-words text-sm leading-7 text-ink/80">{attribute.value}</dd>
          </div>
        ))}
        {paymentMethods.length > 0 ? (
          <div className="min-w-0 sm:col-span-2">
            <dt className="eyebrow">決済方法</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  className="inline-flex items-center rounded-full border border-line bg-paper/70 px-3 py-1 text-xs leading-5 text-ink/75"
                  key={method}
                >
                  {method}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      <motion.a
        className="group mt-7 inline-flex items-center gap-1.5 text-sm font-medium tracking-[0.04em] text-seal transition-colors hover:text-seal-deep"
        href={googleMapUrl}
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

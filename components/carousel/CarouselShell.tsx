"use client";

import type { CSSProperties } from "react";
import type { CarouselApi } from "@/hooks/useCarousel";
import { cn } from "@/lib/cn";

type Props = {
  api: CarouselApi;
  count: number;
  children: React.ReactNode;
  className?: string;
  /** スライド領域の縦横比（Tailwind class） */
  aspectClassName?: string;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
};

/**
 * カルーセル共通の枠・ドット・hover一時停止。
 * 中身（スライド描画）は children で差し替える。
 * 配色はルート配下にスコープした --shiori-* 変数を参照する。
 */
export function CarouselShell({
  api,
  count,
  children,
  className,
  aspectClassName = "aspect-[3/4]",
  viewportClassName,
  viewportStyle,
}: Props) {
  return (
    <div
      className={cn("flex w-full flex-col items-center gap-7", className)}
      onMouseEnter={api.pause}
      onMouseLeave={api.resume}
    >
      <div className="relative w-full" style={{ perspective: 1600 }}>
        {/* スライド領域: 高さは親で固定 */}
        <div
          className={cn(
            "relative w-full max-w-[26rem] overflow-visible sm:max-w-[28rem]",
            aspectClassName,
            viewportClassName,
          )}
          style={viewportStyle}
        >
          {children}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1} 番目へ`}
            aria-current={i === api.index}
            onClick={() => api.goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === api.index
                ? "w-7 bg-[var(--shiori-ink)]"
                : "w-1.5 bg-[var(--shiori-line)] hover:bg-[var(--shiori-ink-soft)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

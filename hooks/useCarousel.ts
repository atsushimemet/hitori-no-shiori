"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselDirection = 1 | -1;

type Options = {
  /** スライド枚数 */
  count: number;
  /** オートプレイ間隔(ms)。0 以下で無効 */
  autoPlayMs?: number;
};

export type CarouselApi = {
  index: number;
  direction: CarouselDirection;
  next: () => void;
  prev: () => void;
  goTo: (to: number) => void;
  /** hover 等での一時停止トグル */
  pause: () => void;
  resume: () => void;
};

/**
 * カルーセルの index / direction / オートプレイを集約。
 */
export function useCarousel({ count, autoPlayMs = 0 }: Options): CarouselApi {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<CarouselDirection>(1);
  const [paused, setPaused] = useState(false);

  const wrap = useCallback((n: number) => ((n % count) + count) % count, [count]);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => wrap(i + 1));
  }, [wrap]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => wrap(i - 1));
  }, [wrap]);

  const goTo = useCallback(
    (to: number) => {
      setIndex((i) => {
        const target = wrap(to);
        setDirection(target >= i ? 1 : -1);
        return target;
      });
    },
    [wrap],
  );

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  // 最新の next を ref に保持し、interval を貼り直さない
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    if (autoPlayMs <= 0 || paused || count <= 1) return;
    const id = window.setInterval(() => nextRef.current(), autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, paused, count]);

  return { index, direction, next, prev, goTo, pause, resume };
}

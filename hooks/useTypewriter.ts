"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";

type TypewriterState = {
  text: string;
  promptIndex: number;
  isDeleting: boolean;
};

type UseTypewriterOptions = {
  prompts: readonly string[];
  paused?: boolean;
};

const TYPE_DELAY = 54;
const DELETE_DELAY = 30;
const COMPLETE_DELAY = 1480;
const NEXT_PROMPT_DELAY = 420;
const REDUCED_MOTION_DELAY = 2600;

export function useTypewriter({ prompts, paused = false }: UseTypewriterOptions): TypewriterState {
  const shouldReduceMotion = useReducedMotion();
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const characters = useMemo(() => Array.from(prompts[promptIndex] ?? ""), [promptIndex, prompts]);
  const text = shouldReduceMotion
    ? (prompts[promptIndex] ?? "")
    : characters.slice(0, charIndex).join("");

  useEffect(() => {
    if (prompts.length === 0 || paused) {
      return undefined;
    }

    if (shouldReduceMotion) {
      const timeout = window.setTimeout(() => {
        setPromptIndex((current) => (current + 1) % prompts.length);
      }, REDUCED_MOTION_DELAY);

      return () => window.clearTimeout(timeout);
    }

    const isComplete = charIndex === characters.length;
    const isEmpty = charIndex === 0;
    let delay = TYPE_DELAY;

    if (!isDeleting && isComplete) {
      delay = COMPLETE_DELAY;
    } else if (isDeleting && isEmpty) {
      delay = NEXT_PROMPT_DELAY;
    } else if (isDeleting) {
      delay = DELETE_DELAY;
    }

    const timeout = window.setTimeout(() => {
      if (!isDeleting && isComplete) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && isEmpty) {
        setIsDeleting(false);
        setPromptIndex((current) => (current + 1) % prompts.length);
        return;
      }

      setCharIndex((current) => current + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [charIndex, characters.length, isDeleting, paused, prompts.length, shouldReduceMotion]);

  return {
    text,
    promptIndex,
    isDeleting: shouldReduceMotion ? false : isDeleting,
  };
}

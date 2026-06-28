"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

export type PromptInteractionState = "idle" | "intent" | "focused" | "typing" | "submitted";

type UsePromptInteractionResult = {
  state: PromptInteractionState;
  value: string;
  setValue: (value: string) => void;
  isTypewriterPaused: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event?: FormEvent<HTMLFormElement>, fallbackValue?: string) => void;
};

const BLUR_RETURN_DELAY = 420;

export function usePromptInteraction(): UsePromptInteractionResult {
  const [state, setState] = useState<PromptInteractionState>("idle");
  const [value, setValue] = useState("");
  const blurTimeoutRef = useRef<number | null>(null);

  const clearBlurTimeout = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    },
    [],
  );

  const hasValue = value.trim().length > 0;

  return {
    state,
    value,
    setValue,
    isTypewriterPaused: state === "focused" || state === "typing" || state === "submitted",
    handleMouseEnter: () => {
      clearBlurTimeout();
      setState((current) => (current === "idle" ? "intent" : current));
    },
    handleMouseLeave: () => {
      setState((current) => (current === "intent" ? "idle" : current));
    },
    handleFocus: () => {
      if (state === "submitted") {
        return;
      }

      clearBlurTimeout();
      setState(hasValue ? "typing" : "focused");
    },
    handleBlur: () => {
      if (state === "submitted") {
        return;
      }

      if (hasValue) {
        setState("typing");
        return;
      }

      blurTimeoutRef.current = window.setTimeout(() => {
        setState("idle");
      }, BLUR_RETURN_DELAY);
    },
    handleChange: (event) => {
      if (state === "submitted") {
        return;
      }

      const nextValue = event.target.value;
      setValue(nextValue);
      setState(nextValue.trim().length > 0 ? "typing" : "focused");
    },
    handleSubmit: (event, fallbackValue) => {
      event?.preventDefault();
      clearBlurTimeout();

      setValue((current) => {
        if (current.trim().length > 0) {
          return current;
        }

        return fallbackValue?.trim() ? fallbackValue : current;
      });
      setState("submitted");
    },
  };
}

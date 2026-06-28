"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookmarkIntro } from "@/components/hero/BookmarkIntro";
import { HeroCTA } from "@/components/hero/HeroCTA";
import { PromptBox } from "@/components/hero/PromptBox";
import { PromptExamples } from "@/components/hero/PromptExamples";
import { ThinkingState } from "@/components/hero/ThinkingState";
import { TypewriterText } from "@/components/hero/TypewriterText";
import { usePromptInteraction } from "@/hooks/usePromptInteraction";
import { useTypewriter } from "@/hooks/useTypewriter";
import { promptExamples } from "@/lib/prompts";

export function Hero() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const contentDelay = shouldReduceMotion ? 0 : 0.08;
  const promptInteraction = usePromptInteraction();
  const typewriter = useTypewriter({
    paused: promptInteraction.isTypewriterPaused,
    prompts: promptExamples,
  });
  const fallbackPrompt = typewriter.text.trim() || promptExamples[typewriter.promptIndex] || "";

  return (
    <main className="flex min-h-screen items-center justify-center px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <AnimatePresence>
          {!isIntroComplete ? (
            <BookmarkIntro key="bookmark-intro" onComplete={() => setIsIntroComplete(true)} />
          ) : null}
        </AnimatePresence>

        <motion.div
          animate={isIntroComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          className="flex w-full flex-col items-center"
          initial={{ opacity: 0, y: 8 }}
          transition={{ delay: contentDelay, duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink sm:text-6xl">
            ひとりの栞
          </h1>
          <p className="mt-5 text-base leading-8 text-ink/75 sm:text-lg">
            今の気分からひとり時間を提案します
          </p>
          <div className="mt-10 w-full max-w-xl">
            <PromptBox
              onBlur={promptInteraction.handleBlur}
              onChange={promptInteraction.handleChange}
              onFocus={promptInteraction.handleFocus}
              onMouseEnter={promptInteraction.handleMouseEnter}
              onMouseLeave={promptInteraction.handleMouseLeave}
              onSubmit={(event) => promptInteraction.handleSubmit(event, fallbackPrompt)}
              state={promptInteraction.state}
              value={promptInteraction.value}
            >
              <TypewriterText
                isDeleting={typewriter.isDeleting}
                promptIndex={typewriter.promptIndex}
                text={typewriter.text}
              />
            </PromptBox>
            <PromptExamples />
          </div>
          <HeroCTA
            onClick={() => promptInteraction.handleSubmit(undefined, fallbackPrompt)}
            state={promptInteraction.state}
          />
          {promptInteraction.state === "submitted" ? <ThinkingState /> : null}
        </motion.div>
      </section>
    </main>
  );
}

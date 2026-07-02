"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookmarkIntro } from "@/components/hero/BookmarkIntro";
import { HeroCTA } from "@/components/hero/HeroCTA";
import { PromptBox } from "@/components/hero/PromptBox";
import { PromptExamples } from "@/components/hero/PromptExamples";
import { TypewriterText } from "@/components/hero/TypewriterText";
import { usePromptInteraction } from "@/hooks/usePromptInteraction";
import { useTypewriter } from "@/hooks/useTypewriter";
import { createInitialChatSession, writeChatSession } from "@/lib/chatSession";
import { mockInitialUserMessage } from "@/lib/mockChat";
import { promptExamples } from "@/lib/prompts";

type ViewState = "hero" | "transitioning";

const CHAT_TRANSITION_DELAY = 520;

export function Hero() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("hero");
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const contentDelay = shouldReduceMotion ? 0 : 0.08;
  const promptInteraction = usePromptInteraction();
  const typewriter = useTypewriter({
    paused: promptInteraction.isTypewriterPaused,
    prompts: promptExamples,
  });
  const fallbackPrompt = typewriter.text.trim() || promptExamples[typewriter.promptIndex] || mockInitialUserMessage;

  async function startConversation(message: string) {
    const nextMessage = message.trim() || fallbackPrompt;

    if (viewState !== "hero") {
      return;
    }

    promptInteraction.handleSubmit(undefined, nextMessage);
    writeChatSession(createInitialChatSession(nextMessage));
    setViewState("transitioning");
    await new Promise((resolve) => window.setTimeout(resolve, shouldReduceMotion ? 160 : CHAT_TRANSITION_DELAY));
    router.push("/chat");
  }

  return (
    <AnimatePresence mode="wait">
      <motion.main
        animate={{ opacity: viewState === "transitioning" ? 0 : 1, y: viewState === "transitioning" ? -16 : 0 }}
        className="relative flex min-h-screen flex-col px-[var(--space-page-x)] py-8 sm:py-10"
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
        key="hero"
        transition={{ duration: shouldReduceMotion ? 0.18 : 0.38, ease: [0.4, 0, 0.2, 1] }}
      >
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
          <AnimatePresence>
            {!isIntroComplete ? <BookmarkIntro key="bookmark-intro" onComplete={() => setIsIntroComplete(true)} /> : null}
          </AnimatePresence>

          <motion.div
            animate={isIntroComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            className="flex w-full flex-col items-center"
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: contentDelay, duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="relative font-serif text-5xl font-medium leading-[1.08] tracking-[0.04em] text-coffee sm:text-7xl">
              ひとりの栞
            </h1>

            <div className="mt-6 flex items-center gap-3 text-bark">
              <span className="hairline w-8" />
              <p className="text-sm leading-7 tracking-[0.08em] sm:text-base">
                今日行くお店を決めましょう。
              </p>
              <span className="hairline w-8" />
            </div>

            <div className="mt-10 w-full max-w-xl">
              <PromptBox
                layoutId={shouldReduceMotion ? undefined : "prompt-message"}
                onBlur={promptInteraction.handleBlur}
                onChange={promptInteraction.handleChange}
                onFocus={promptInteraction.handleFocus}
                onMouseEnter={promptInteraction.handleMouseEnter}
                onMouseLeave={promptInteraction.handleMouseLeave}
                onSubmit={(event) => {
                  event.preventDefault();
                  void startConversation(promptInteraction.value);
                }}
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
              onClick={() => {
                void startConversation(promptInteraction.value);
              }}
              state={promptInteraction.state}
            />
          </motion.div>
        </section>
      </motion.main>
    </AnimatePresence>
  );
}

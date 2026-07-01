"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChatView } from "@/components/chat/ChatView";
import { BookmarkIntro } from "@/components/hero/BookmarkIntro";
import { HeroCTA } from "@/components/hero/HeroCTA";
import { PromptBox } from "@/components/hero/PromptBox";
import { PromptExamples } from "@/components/hero/PromptExamples";
import { TypewriterText } from "@/components/hero/TypewriterText";
import { usePromptInteraction } from "@/hooks/usePromptInteraction";
import { useTypewriter } from "@/hooks/useTypewriter";
import { mockInitialUserMessage } from "@/lib/mockChat";
import { promptExamples } from "@/lib/prompts";

type ViewState = "chat" | "hero" | "transitioning";

const CHAT_TRANSITION_DELAY = 520;

export function Hero() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [viewState, setViewState] = useState<ViewState>("hero");
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

    setSubmittedMessage(nextMessage);
    promptInteraction.handleSubmit(undefined, nextMessage);
    setViewState("transitioning");
    await new Promise((resolve) => window.setTimeout(resolve, shouldReduceMotion ? 160 : CHAT_TRANSITION_DELAY));
    setViewState("chat");
  }

  return (
    <AnimatePresence mode="wait">
      {viewState === "chat" ? (
        <ChatView key="chat" userMessage={submittedMessage || fallbackPrompt} />
      ) : (
        <motion.main
          animate={{ opacity: viewState === "transitioning" ? 0 : 1, y: viewState === "transitioning" ? -16 : 0 }}
          className="relative flex min-h-screen flex-col px-[var(--space-page-x)] py-8 sm:py-10"
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
          key="hero"
          transition={{ duration: shouldReduceMotion ? 0.18 : 0.38, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* 見当（トンボ）マーク — 誌面の四隅 */}
          <CornerTicks />

          {/* マストヘッド */}
          <motion.header
            animate={isIntroComplete ? { opacity: 1 } : { opacity: 0 }}
            className="mx-auto flex w-full max-w-4xl items-center justify-between"
            initial={{ opacity: 0 }}
            transition={{ delay: contentDelay + 0.1, duration: 0.6 }}
          >
            <span className="eyebrow">ひとりの栞</span>
            <span className="eyebrow hidden sm:inline">A Guide to Your Solitude</span>
            <span className="figure text-[0.6875rem] text-bark">No. 01</span>
          </motion.header>

          <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
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
              <span className="eyebrow text-seal">今日の一枚</span>

              <h1 className="relative mt-5 font-serif text-5xl font-medium leading-[1.08] tracking-[0.04em] text-coffee sm:text-7xl">
                ひとりの栞
              </h1>

              <div className="mt-6 flex items-center gap-3 text-bark">
                <span className="hairline w-8" />
                <p className="text-sm leading-7 tracking-[0.08em] sm:text-base">
                  今の気分から、ひとり時間を一枚。
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

          {/* フッターの奥付 */}
          <motion.footer
            animate={isIntroComplete ? { opacity: 1 } : { opacity: 0 }}
            className="mx-auto flex w-full max-w-4xl items-center justify-between text-bark"
            initial={{ opacity: 0 }}
            transition={{ delay: contentDelay + 0.14, duration: 0.6 }}
          >
            <span className="eyebrow">店探しではなく、時間の案内</span>
            <span className="eyebrow hidden sm:inline">静けさ・余白・直感</span>
          </motion.footer>
        </motion.main>
      )}
    </AnimatePresence>
  );
}

function CornerTicks() {
  const positions = [
    "left-4 top-4 border-l border-t",
    "right-4 top-4 border-r border-t",
    "bottom-4 left-4 border-b border-l",
    "bottom-4 right-4 border-b border-r",
  ] as const;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {positions.map((position) => (
        <span className={`absolute h-4 w-4 border-line/80 ${position}`} key={position} />
      ))}
    </div>
  );
}

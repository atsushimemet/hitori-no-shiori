"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AssistantLoading } from "@/components/chat/AssistantLoading";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { resolvePlaceCategoryForMessage } from "@/lib/placeCategories";

type ChatViewProps = {
  userMessage: string;
};

type Message = {
  content: string;
  id: string;
  role: "assistant" | "user";
};

const ASSISTANT_REPLY_DELAY = 1500;
const ROUTE_TRANSITION_DELAY = 1200;

export function ChatView({ userMessage }: ChatViewProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const category = resolvePlaceCategoryForMessage(userMessage);
  const assistantQuestion = category.assistantQuestion;
  const assistantListMessage = category.assistantListMessage;
  const nextRoute = category.route;
  const conversationRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [composerValue, setComposerValue] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: userMessage,
      id: "initial-user-message",
      role: "user",
    },
  ]);

  useEffect(() => {
    conversationRef.current?.focus();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setMessages((current) => [
          ...current,
          {
            content: assistantQuestion,
            id: "assistant-question",
            role: "assistant",
          },
        ]);
        setIsAssistantLoading(false);
        window.setTimeout(() => composerRef.current?.focus(), 0);
      },
      shouldReduceMotion ? 400 : ASSISTANT_REPLY_DELAY,
    );

    return () => window.clearTimeout(timeout);
  }, [assistantQuestion, shouldReduceMotion]);

  function handleComposerSubmit() {
    const nextMessage = composerValue.trim();

    if (!nextMessage || isAssistantLoading || isNavigating) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        content: nextMessage,
        id: `user-message-${Date.now()}`,
        role: "user",
      },
    ]);
    setComposerValue("");
    setIsAssistantLoading(true);

    window.setTimeout(
      () => {
        setMessages((current) => [
          ...current,
          {
            content: assistantListMessage,
            id: `assistant-${category.id}-list-message`,
            role: "assistant",
          },
        ]);
        setIsAssistantLoading(false);
        setIsNavigating(true);

        window.setTimeout(
          () => {
            router.push(nextRoute);
          },
          shouldReduceMotion ? 250 : ROUTE_TRANSITION_DELAY,
        );
      },
      shouldReduceMotion ? 400 : ASSISTANT_REPLY_DELAY,
    );
  }

  return (
    <motion.main
      animate={{ opacity: isNavigating ? 0 : 1, y: isNavigating && !shouldReduceMotion ? -10 : 0 }}
      className="flex min-h-screen flex-col bg-transparent px-[var(--space-page-x)] py-6 sm:py-8"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.42, ease: [0.4, 0, 0.2, 1] }}
    >
      <section
        aria-label="ひとり時間の対話"
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between outline-none"
        ref={conversationRef}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between border-b border-line pb-4">
          <span className="eyebrow text-seal">対話</span>
          <span className="eyebrow hidden sm:inline">Finding Your Solitude</span>
          <span className="figure text-[0.6875rem] text-bark">No. 01</span>
        </header>
        <div className="flex flex-1 flex-col justify-end gap-7 pb-8 pt-10 sm:gap-8 sm:pt-14">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                layoutId={index === 0 && message.role === "user" && !shouldReduceMotion ? "prompt-message" : undefined}
                role={message.role}
              >
                {message.content}
              </ChatMessage>
            ))}
            {isAssistantLoading ? (
              <motion.div
                className="flex justify-start"
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                key="assistant-loading"
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <AssistantLoading />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <ChatComposer
          disabled={isAssistantLoading || isNavigating}
          onChange={setComposerValue}
          onSubmit={handleComposerSubmit}
          ref={composerRef}
          value={composerValue}
        />
      </section>
    </motion.main>
  );
}

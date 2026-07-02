"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AssistantLoading } from "@/components/chat/AssistantLoading";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import {
  createInitialChatSession,
  readChatSession,
  writeChatSession,
  type ChatSession,
} from "@/lib/chatSession";
import {
  mockAssistantBarListMessage,
  mockAssistantKissaListMessage,
  mockAssistantKissaQuestion,
  mockAssistantQuestion,
  mockInitialUserMessage,
} from "@/lib/mockChat";

const ASSISTANT_REPLY_DELAY = 1500;
const ROUTE_TRANSITION_DELAY = 1200;

export function ChatView() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const conversationRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const hasFocusedConversationRef = useRef(false);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const phase = session?.phase;
  const isAssistantLoading = session?.isAssistantLoading ?? false;
  const isNavigating = session?.isNavigating ?? false;
  const isComposerDisabled = isAssistantLoading || isNavigating || phase !== "awaiting-user-location";
  const isKissaConversation = session?.recommendationRoute === "/jun-kissa";
  const assistantQuestion = isKissaConversation ? mockAssistantKissaQuestion : mockAssistantQuestion;
  const assistantListMessage = isKissaConversation ? mockAssistantKissaListMessage : mockAssistantBarListMessage;
  const nextRoute = session?.recommendationRoute ?? "/casual-bar";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSession(readChatSession() ?? createInitialChatSession(mockInitialUserMessage));
      setHasLoadedSession(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (session && !hasFocusedConversationRef.current) {
      hasFocusedConversationRef.current = true;
      conversationRef.current?.focus();
    }
  }, [session]);

  useEffect(() => {
    if (!hasLoadedSession || !session) {
      return;
    }

    writeChatSession(session);
  }, [hasLoadedSession, session]);

  useEffect(() => {
    if (phase !== "awaiting-assistant-question" || !isAssistantLoading) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        setSession((current) => {
          if (!current || current.phase !== "awaiting-assistant-question" || !current.isAssistantLoading) {
            return current;
          }

          const hasAssistantQuestion = current.messages.some((message) => message.id === "assistant-question");

          return {
            ...current,
            isAssistantLoading: false,
            messages: hasAssistantQuestion
              ? current.messages
              : [
                  ...current.messages,
                  {
                    content: assistantQuestion,
                    id: "assistant-question",
                    role: "assistant",
                  },
                ],
            phase: "awaiting-user-location",
          };
        });
        window.setTimeout(() => composerRef.current?.focus(), 0);
      },
      shouldReduceMotion ? 400 : ASSISTANT_REPLY_DELAY,
    );

    return () => window.clearTimeout(timeout);
  }, [assistantQuestion, isAssistantLoading, phase, shouldReduceMotion]);

  useEffect(() => {
    if (phase !== "awaiting-assistant-list" || !isAssistantLoading) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        setSession((current) => {
          if (!current || current.phase !== "awaiting-assistant-list" || !current.isAssistantLoading) {
            return current;
          }

          const hasAssistantListMessage = current.messages.some((message) => message.id === "assistant-list-message");

          return {
            ...current,
            isAssistantLoading: false,
            isNavigating: true,
            messages: hasAssistantListMessage
              ? current.messages
              : [
                  ...current.messages,
                  {
                    content: assistantListMessage,
                    id: "assistant-list-message",
                    role: "assistant",
                  },
                ],
            phase: "candidate-navigation-pending",
          };
        });
      },
      shouldReduceMotion ? 400 : ASSISTANT_REPLY_DELAY,
    );

    return () => window.clearTimeout(timeout);
  }, [assistantListMessage, isAssistantLoading, phase, shouldReduceMotion]);

  useEffect(() => {
    if (phase !== "candidate-navigation-pending" || !isNavigating) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        router.push(nextRoute);
      },
      shouldReduceMotion ? 250 : ROUTE_TRANSITION_DELAY,
    );

    return () => window.clearTimeout(timeout);
  }, [isNavigating, nextRoute, phase, router, shouldReduceMotion]);

  function handleComposerSubmit() {
    if (!session) {
      return;
    }

    setSession((current) => {
      if (!current || current.phase !== "awaiting-user-location" || current.isAssistantLoading || current.isNavigating) {
        return current;
      }

      const nextMessage = current.composerValue.trim();

      if (!nextMessage) {
        return current;
      }

      return {
        ...current,
        composerValue: "",
        isAssistantLoading: true,
        messages: [
          ...current.messages,
          {
            content: nextMessage,
            id: `user-message-${Date.now()}`,
            role: "user",
          },
        ],
        phase: "awaiting-assistant-list",
      };
    });
  }

  return (
    <motion.main
      animate={{ opacity: isNavigating ? 0 : 1, y: isNavigating && !shouldReduceMotion ? -10 : 0 }}
      className="flex min-h-screen flex-col bg-transparent px-[var(--space-page-x)] py-6 sm:py-8"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.42, ease: [0.4, 0, 0.2, 1] }}
    >
      {session ? (
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
              {session.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  layoutId={
                    index === 0 && message.role === "user" && !shouldReduceMotion ? "prompt-message" : undefined
                  }
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
            disabled={isComposerDisabled}
            onChange={(value) => {
              setSession((current) => (current ? { ...current, composerValue: value } : current));
            }}
            onSubmit={handleComposerSubmit}
            ref={composerRef}
            value={session.composerValue}
          />
        </section>
      ) : null}
    </motion.main>
  );
}

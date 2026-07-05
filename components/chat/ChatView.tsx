"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AssistantLoading } from "@/components/chat/AssistantLoading";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { PlaceRouteLoading } from "@/components/place/PlaceRouteLoading";
import {
  createInitialChatSession,
  readChatSession,
  writeChatSession,
  type ChatSession,
  type ChatSessionMessage,
} from "@/lib/chatSession";
import { mockInitialUserMessage } from "@/lib/mockChat";
import { placeCategories, resolvePlaceCategoryForMessage, type PlaceCategoryConfig } from "@/lib/placeCategories";

const ROUTE_TRANSITION_DELAY = 1200;

type IntentApiResponse =
  | { categoryId: string; source?: "fallback"; status: "resolved" }
  | { assistantMessage: string; status: "question" };

// 確定したカテゴリを会話に反映し、店舗ページへの遷移待ちにする。
function applyResolvedCategory(current: ChatSession, category: PlaceCategoryConfig): ChatSession {
  const listMessageId = `assistant-${category.id}-list-message`;
  const hasListMessage = current.messages.some((message) => message.id === listMessageId);

  return {
    ...current,
    isAssistantLoading: false,
    isNavigating: true,
    messages: hasListMessage
      ? current.messages
      : [
          ...current.messages,
          { content: category.assistantListMessage, id: listMessageId, role: "assistant" },
        ],
    phase: "candidate-navigation-pending",
    recommendationRoute: category.route,
  };
}

// LLM が聞き返したときの会話反映。聞き返しは複数回あり得るため、id は一意にする。
function applyClarifyingQuestion(current: ChatSession, assistantMessage: string): ChatSession {
  return {
    ...current,
    isAssistantLoading: false,
    messages: [
      ...current.messages,
      { content: assistantMessage, id: `assistant-question-${current.messages.length}`, role: "assistant" },
    ],
    phase: "awaiting-user-reply",
  };
}

export function ChatView() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const conversationRef = useRef<HTMLDivElement>(null);
  const hasFocusedConversationRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastRequestedCountRef = useRef(0);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const phase = session?.phase;
  const isAssistantLoading = session?.isAssistantLoading ?? false;
  const isNavigating = session?.isNavigating ?? false;
  const isComposerDisabled = isAssistantLoading || isNavigating || phase !== "awaiting-user-reply";
  const nextRoute = session?.recommendationRoute;

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

  // 会話履歴を /api/intent に送り、結果（確定 or 聞き返し）を会話へ反映する。
  const requestIntent = useCallback(
    async (currentMessages: ChatSessionMessage[], initialUserMessage: string) => {
      const resolveByFallback = () => {
        const category = resolvePlaceCategoryForMessage(initialUserMessage);
        setSession((current) => (current ? applyResolvedCategory(current, category) : current));
      };

      try {
        const response = await fetch("/api/intent", {
          body: JSON.stringify({
            messages: currentMessages.map((message) => ({ content: message.content, role: message.role })),
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          resolveByFallback();
          return;
        }

        const result = (await response.json()) as IntentApiResponse;

        if (result.status === "question") {
          setSession((current) => (current ? applyClarifyingQuestion(current, result.assistantMessage) : current));
          return;
        }

        const category = placeCategories[result.categoryId as keyof typeof placeCategories];
        if (!category) {
          resolveByFallback();
          return;
        }

        setSession((current) => (current ? applyResolvedCategory(current, category) : current));
      } catch (error) {
        console.error("意図判定リクエストに失敗しました", error);
        resolveByFallback();
      }
    },
    [],
  );

  // 応答待ち（初回マウント・ユーザー返信後）になったら一度だけ送信する。
  useEffect(() => {
    if (!hasLoadedSession || !session || session.phase !== "awaiting-assistant-reply") {
      return;
    }

    if (inFlightRef.current || lastRequestedCountRef.current === session.messages.length) {
      return;
    }

    inFlightRef.current = true;
    lastRequestedCountRef.current = session.messages.length;

    void requestIntent(session.messages, session.initialUserMessage).finally(() => {
      inFlightRef.current = false;
    });
  }, [hasLoadedSession, requestIntent, session]);

  useEffect(() => {
    if (phase !== "candidate-navigation-pending" || !isNavigating || !nextRoute) {
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
      if (!current || current.phase !== "awaiting-user-reply" || current.isAssistantLoading || current.isNavigating) {
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
        phase: "awaiting-assistant-reply",
      };
    });
  }

  return (
    <>
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
              value={session.composerValue}
            />
          </section>
        ) : null}
      </motion.main>
      <AnimatePresence>{isNavigating ? <PlaceRouteLoading key="place-route-loading" /> : null}</AnimatePresence>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AssistantLoading } from "@/components/chat/AssistantLoading";
import { CategoryChoices } from "@/components/chat/CategoryChoices";
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
import {
  placeCategories,
  resolvePlaceCategoryForMessage,
  type PlaceCategoryConfig,
  type PlaceCategoryId,
} from "@/lib/placeCategories";

const ROUTE_TRANSITION_DELAY = 1200;

type IntentApiResponse =
  | { activityLabel: string; categoryId: string; locationName: string; source?: "fallback"; status: "resolved" }
  | { assistantMessage: string; status: "question" }
  | { assistantMessage: string; categoryIds: string[]; status: "choose" };

function isPlaceCategoryId(value: string): value is PlaceCategoryId {
  return value in placeCategories;
}

// やりたいこと・場所が揃ったら、すぐ遷移せず確認選択肢を出す。
function applySearchConfirmation(
  current: ChatSession,
  category: PlaceCategoryConfig,
  activityLabel: string,
  locationName: string,
): ChatSession {
  const confirmationMessageId = `assistant-${category.id}-${locationName}-confirmation`;
  const hasConfirmationMessage = current.messages.some((message) => message.id === confirmationMessageId);

  return {
    ...current,
    isAssistantLoading: false,
    isNavigating: false,
    messages: hasConfirmationMessage
      ? current.messages
      : [
          ...current.messages,
          {
            content: `${locationName}で${activityLabel}のお店を探しますか？`,
            id: confirmationMessageId,
            role: "assistant",
          },
        ],
    pendingActivityLabel: activityLabel,
    pendingCategoryId: category.id,
    pendingLocationName: locationName,
    phase: "awaiting-search-confirmation",
    recommendationRoute: category.route,
    selectedStationName: locationName,
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

// 聞き返し上限に達しても絞れなかったとき、案内文を出してカテゴリ選択に切り替える。
function applyCategoryChoicePrompt(current: ChatSession, assistantMessage: string): ChatSession {
  return {
    ...current,
    isAssistantLoading: false,
    messages: [
      ...current.messages,
      { content: assistantMessage, id: `assistant-choice-${current.messages.length}`, role: "assistant" },
    ],
    phase: "awaiting-user-choice",
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
        setSession((current) =>
          current
            ? applyClarifyingQuestion(current, `${category.label}なら、どのあたりで探しましょうか？`)
            : current,
        );
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

        if (result.status === "choose") {
          setSession((current) => (current ? applyCategoryChoicePrompt(current, result.assistantMessage) : current));
          return;
        }

        const category = isPlaceCategoryId(result.categoryId) ? placeCategories[result.categoryId] : null;
        if (!category) {
          resolveByFallback();
          return;
        }

        setSession((current) =>
          current
            ? applySearchConfirmation(current, category, result.activityLabel, result.locationName)
            : current,
        );
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
        const station = session?.selectedStationName?.trim();
        const href = station ? `${nextRoute}?station=${encodeURIComponent(station)}` : nextRoute;
        router.push(href);
      },
      shouldReduceMotion ? 250 : ROUTE_TRANSITION_DELAY,
    );

    return () => window.clearTimeout(timeout);
  }, [isNavigating, nextRoute, phase, router, session?.selectedStationName, shouldReduceMotion]);

  function handleSelectCategory(category: PlaceCategoryConfig) {
    setSession((current) => {
      if (!current || current.phase !== "awaiting-user-choice" || current.isNavigating) {
        return current;
      }

      return {
        ...current,
        isAssistantLoading: true,
        messages: [
          ...current.messages,
          {
            content: category.label,
            id: `user-category-${category.id}-${Date.now()}`,
            role: "user",
          },
        ],
        pendingActivityLabel: category.label,
        pendingCategoryId: category.id,
        phase: "awaiting-assistant-reply",
        recommendationRoute: category.route,
      };
    });
  }

  function handleConfirmSearch() {
    setSession((current) => {
      if (!current || current.phase !== "awaiting-search-confirmation" || !current.pendingCategoryId) {
        return current;
      }

      const category = placeCategories[current.pendingCategoryId];

      return {
        ...current,
        isNavigating: true,
        phase: "candidate-navigation-pending",
        recommendationRoute: category.route,
        selectedStationName: current.pendingLocationName,
      };
    });
  }

  function handleReviewCandidates() {
    setSession((current) => {
      if (!current || current.phase !== "awaiting-search-confirmation") {
        return current;
      }

      return {
        ...current,
        phase: "showing-route-choices",
      };
    });
  }

  function handleFeedbackStart() {
    setSession((current) =>
      current && current.phase === "showing-route-choices" ? { ...current, phase: "collecting-feedback" } : current,
    );
  }

  function handleAlternativeCategory(category: PlaceCategoryConfig) {
    setSession((current) => {
      if (!current || current.phase !== "showing-route-choices" || current.isNavigating) {
        return current;
      }

      return {
        ...current,
        isNavigating: true,
        pendingActivityLabel: category.label,
        pendingCategoryId: category.id,
        phase: "candidate-navigation-pending",
        recommendationRoute: category.route,
        selectedStationName: current.pendingLocationName,
      };
    });
  }

  function handleFeedbackSubmit() {
    setSession((current) => {
      if (!current || current.phase !== "collecting-feedback" || !current.feedbackText?.trim()) {
        return current;
      }

      // TODO: スプレッドシート連携時は、この入力を専用APIへ送信する。
      return {
        ...current,
        feedbackSubmitted: true,
        feedbackText: current.feedbackText.trim(),
      };
    });
  }

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
            {phase === "awaiting-user-choice" ? (
              <CategoryChoices disabled={isNavigating} onSelect={handleSelectCategory} />
            ) : phase === "awaiting-search-confirmation" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex w-full max-w-3xl flex-wrap gap-2"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                transition={{ duration: shouldReduceMotion ? 0.2 : 0.42, ease: [0.4, 0, 0.2, 1] }}
                role="group"
                aria-label="店舗探しを確認する"
              >
                <button
                  className="rounded-control bg-coffee px-4 py-2 text-sm font-medium text-cream shadow-plate transition-colors hover:bg-seal disabled:cursor-default disabled:opacity-50"
                  disabled={isNavigating}
                  onClick={handleConfirmSearch}
                  type="button"
                >
                  はい
                </button>
                <button
                  className="rounded-control border border-line bg-cream px-4 py-2 text-sm text-ink shadow-plate transition-colors hover:border-coffee/40 hover:bg-paper disabled:cursor-default disabled:opacity-50"
                  disabled={isNavigating}
                  onClick={handleReviewCandidates}
                  type="button"
                >
                  もう少し検討する
                </button>
              </motion.div>
            ) : phase === "showing-route-choices" ? (
              <CategoryChoices
                ariaLabel="店舗ページを選ぶ"
                disabled={isNavigating}
                onMissing={handleFeedbackStart}
                onSelect={handleAlternativeCategory}
              />
            ) : phase === "collecting-feedback" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-card border border-line bg-paper/80 p-5 shadow-plate"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                transition={{ duration: shouldReduceMotion ? 0.2 : 0.42, ease: [0.4, 0, 0.2, 1] }}
              >
                {session.feedbackSubmitted ? (
                  <p className="text-sm leading-7 text-ink/70">
                    教えてくれてありがとうございます。今後の候補づくりに使います。
                  </p>
                ) : (
                  <>
                    <label className="text-sm font-medium text-coffee" htmlFor="missing-place-feedback">
                      何の店舗があると嬉しいですか？
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        className="min-h-11 flex-1 rounded-control border border-line bg-cream px-4 text-sm text-ink outline-none transition placeholder:text-ink/36 focus:border-coffee/45 focus:ring-2 focus:ring-seal/25"
                        id="missing-place-feedback"
                        onChange={(event) => {
                          setSession((current) => (current ? { ...current, feedbackText: event.target.value } : current));
                        }}
                        placeholder="例：ひとりで入りやすい蕎麦屋"
                        type="text"
                        value={session.feedbackText ?? ""}
                      />
                      <button
                        className="min-h-11 rounded-control bg-coffee px-5 text-sm font-medium text-cream transition-colors hover:bg-seal disabled:cursor-default disabled:opacity-50"
                        disabled={!session.feedbackText?.trim()}
                        onClick={handleFeedbackSubmit}
                        type="button"
                      >
                        送信
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <ChatComposer
                disabled={isComposerDisabled}
                onChange={(value) => {
                  setSession((current) => (current ? { ...current, composerValue: value } : current));
                }}
                onSubmit={handleComposerSubmit}
                value={session.composerValue}
              />
            )}
          </section>
        ) : null}
      </motion.main>
      <AnimatePresence>{isNavigating ? <PlaceRouteLoading key="place-route-loading" /> : null}</AnimatePresence>
    </>
  );
}

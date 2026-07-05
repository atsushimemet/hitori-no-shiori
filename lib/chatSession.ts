import { placeCategories, resolvePlaceCategoryForMessage } from "@/lib/placeCategories";

export type ChatSessionMessage = {
  content: string;
  id: string;
  role: "assistant" | "user";
};

export type ChatSessionPhase =
  | "awaiting-assistant-reply"
  | "awaiting-search-confirmation"
  | "awaiting-user-reply"
  | "awaiting-user-choice"
  | "collecting-feedback"
  | "awaiting-assistant-question"
  | "awaiting-user-location"
  | "awaiting-assistant-list"
  | "recommendations-preview"
  | "recommendations-ready"
  | "showing-route-choices"
  | "candidate-navigation-pending";

export type RecommendationRoute = (typeof placeCategories)[keyof typeof placeCategories]["route"];

export type ChatSession = {
  composerValue: string;
  initialUserMessage: string;
  isAssistantLoading: boolean;
  isNavigating: boolean;
  messages: ChatSessionMessage[];
  phase: ChatSessionPhase;
  feedbackSubmitted?: boolean;
  feedbackText?: string;
  pendingActivityLabel?: string;
  pendingCategoryId?: keyof typeof placeCategories;
  pendingLocationName?: string;
  recommendationRoute: RecommendationRoute;
  selectedStationName?: string;
  version: 1;
};

export const CHAT_SESSION_STORAGE_KEY = "hitori-no-shiori.chat-session.v1";

const CHAT_SESSION_PHASES: ChatSessionPhase[] = [
  "awaiting-assistant-reply",
  "awaiting-search-confirmation",
  "awaiting-user-reply",
  "awaiting-user-choice",
  "collecting-feedback",
  "awaiting-assistant-question",
  "awaiting-user-location",
  "awaiting-assistant-list",
  "recommendations-preview",
  "recommendations-ready",
  "showing-route-choices",
  "candidate-navigation-pending",
];

const RECOMMENDATION_ROUTES = Object.values(placeCategories).map((category) => category.route);

export function createInitialChatSession(initialUserMessage: string): ChatSession {
  const message = initialUserMessage.trim();

  return {
    composerValue: "",
    initialUserMessage: message,
    isAssistantLoading: true,
    isNavigating: false,
    messages: [
      {
        content: message,
        id: "initial-user-message",
        role: "user",
      },
    ],
    phase: "awaiting-assistant-reply",
    // LLM 判定が確定するまでの初期フォールバック値。全経路が失敗しても遷移先を持てるよう、
    // キーワード判定の結果を暫定的に入れておく（確定時に ChatView が上書きする）。
    recommendationRoute: getRecommendationRoute(message),
    version: 1,
  };
}

export function getRecommendationRoute(message: string): RecommendationRoute {
  return resolvePlaceCategoryForMessage(message).route;
}

export function readChatSession(): ChatSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession) as Partial<ChatSession>;

    if (
      parsedSession.version !== 1 ||
      typeof parsedSession.initialUserMessage !== "string" ||
      !Array.isArray(parsedSession.messages) ||
      !isChatSessionPhase(parsedSession.phase)
    ) {
      return null;
    }

    const messages = parsedSession.messages.filter(isChatSessionMessage);

    if (messages.length === 0) {
      return null;
    }

    return normalizeRestoredChatSession({
      composerValue: typeof parsedSession.composerValue === "string" ? parsedSession.composerValue : "",
      initialUserMessage: parsedSession.initialUserMessage,
      isAssistantLoading:
        typeof parsedSession.isAssistantLoading === "boolean" ? parsedSession.isAssistantLoading : false,
      isNavigating: typeof parsedSession.isNavigating === "boolean" ? parsedSession.isNavigating : false,
      messages,
      phase: parsedSession.phase,
      feedbackSubmitted:
        typeof parsedSession.feedbackSubmitted === "boolean" ? parsedSession.feedbackSubmitted : undefined,
      feedbackText: typeof parsedSession.feedbackText === "string" ? parsedSession.feedbackText : undefined,
      pendingActivityLabel:
        typeof parsedSession.pendingActivityLabel === "string" ? parsedSession.pendingActivityLabel : undefined,
      pendingCategoryId:
        typeof parsedSession.pendingCategoryId === "string" && parsedSession.pendingCategoryId in placeCategories
          ? (parsedSession.pendingCategoryId as keyof typeof placeCategories)
          : undefined,
      pendingLocationName:
        typeof parsedSession.pendingLocationName === "string" ? parsedSession.pendingLocationName : undefined,
      recommendationRoute: isRecommendationRoute(parsedSession.recommendationRoute)
        ? parsedSession.recommendationRoute
        : getRecommendationRoute(parsedSession.initialUserMessage),
      selectedStationName:
        typeof parsedSession.selectedStationName === "string" ? parsedSession.selectedStationName : undefined,
      version: 1,
    });
  } catch {
    return null;
  }
}

export function writeChatSession(session: ChatSession) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(normalizeRestoredChatSession(session)));
  } catch {
    // Session persistence is helpful, but the chat should still work without it.
  }
}

export function clearChatSession() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures so navigation can continue.
  }
}

function isChatSessionMessage(message: unknown): message is ChatSessionMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<ChatSessionMessage>;

  return (
    typeof candidate.content === "string" &&
    typeof candidate.id === "string" &&
    (candidate.role === "assistant" || candidate.role === "user")
  );
}

function isChatSessionPhase(phase: unknown): phase is ChatSessionPhase {
  return typeof phase === "string" && CHAT_SESSION_PHASES.includes(phase as ChatSessionPhase);
}

function isRecommendationRoute(route: unknown): route is RecommendationRoute {
  return typeof route === "string" && RECOMMENDATION_ROUTES.includes(route as RecommendationRoute);
}

function normalizeRestoredChatSession(session: ChatSession): ChatSession {
  // 遷移直前で離脱した状態はリスト表示済み（recommendations-ready）に戻す。
  if (session.phase === "candidate-navigation-pending" || session.phase === "recommendations-preview") {
    return {
      ...session,
      isAssistantLoading: false,
      isNavigating: false,
      phase: "recommendations-ready",
    };
  }

  // LLM 応答待ちで離脱した状態は、再マウント時に ChatView が再送信して復帰できるよう、
  // ローディング表示を維持する。
  if (
    session.phase === "awaiting-assistant-reply" ||
    session.phase === "awaiting-assistant-question" ||
    session.phase === "awaiting-assistant-list"
  ) {
    return {
      ...session,
      isAssistantLoading: true,
      isNavigating: false,
      phase: "awaiting-assistant-reply",
    };
  }

  // ユーザーの返信待ち・カテゴリ選択待ちで離脱した状態は、そのまま操作できる状態に戻す。
  if (
    session.phase === "awaiting-user-reply" ||
    session.phase === "awaiting-user-choice" ||
    session.phase === "awaiting-search-confirmation" ||
    session.phase === "showing-route-choices" ||
    session.phase === "collecting-feedback" ||
    session.phase === "awaiting-user-location"
  ) {
    return {
      ...session,
      isAssistantLoading: false,
      isNavigating: false,
      phase: session.phase === "awaiting-user-location" ? "awaiting-user-reply" : session.phase,
    };
  }

  return session;
}

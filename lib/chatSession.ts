import { placeCategories, resolvePlaceCategoryForMessage } from "@/lib/placeCategories";

export type ChatSessionMessage = {
  content: string;
  id: string;
  role: "assistant" | "user";
};

export type ChatSessionPhase =
  | "awaiting-assistant-reply"
  | "awaiting-user-reply"
  | "recommendations-ready"
  | "candidate-navigation-pending";

export type RecommendationRoute = (typeof placeCategories)[keyof typeof placeCategories]["route"];

export type ChatSession = {
  composerValue: string;
  initialUserMessage: string;
  isAssistantLoading: boolean;
  isNavigating: boolean;
  messages: ChatSessionMessage[];
  phase: ChatSessionPhase;
  recommendationRoute: RecommendationRoute;
  selectedStationName?: string;
  version: 1;
};

export const CHAT_SESSION_STORAGE_KEY = "hitori-no-shiori.chat-session.v1";

const CHAT_SESSION_PHASES: ChatSessionPhase[] = [
  "awaiting-assistant-reply",
  "awaiting-user-reply",
  "recommendations-ready",
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
  if (session.phase === "candidate-navigation-pending") {
    return {
      ...session,
      isAssistantLoading: false,
      isNavigating: false,
      phase: "recommendations-ready",
    };
  }

  // LLM 応答待ちで離脱した状態は、再マウント時に ChatView が再送信して復帰できるよう、
  // ローディング表示を維持する。
  if (session.phase === "awaiting-assistant-reply") {
    return {
      ...session,
      isAssistantLoading: true,
      isNavigating: false,
    };
  }

  // ユーザーの返信待ちで離脱した状態は、そのまま入力できる状態に戻す。
  if (session.phase === "awaiting-user-reply") {
    return {
      ...session,
      isAssistantLoading: false,
      isNavigating: false,
    };
  }

  return session;
}

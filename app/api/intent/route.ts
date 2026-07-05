import { NextResponse } from "next/server";
import { resolveIntent, type IntentMessage } from "@/lib/intentResolution";
import { placeCategories, type PlaceCategoryConfig } from "@/lib/placeCategories";

export const dynamic = "force-dynamic";

// 曖昧なときの聞き返しは会話全体で最大2回まで。これを超えても絞れなければ、
// 推測で勝手に遷移せず、ユーザーにカテゴリを選んでもらう（choose）。
const MAX_CLARIFYING_QUESTIONS = 2;

const CHOOSE_MESSAGE = "うまく絞りきれませんでした。よければ、今の気分に近いものを選んでください。";

const ALL_CATEGORY_IDS = Object.keys(placeCategories);

type IntentResponse =
  | { activityLabel: string; categoryId: string; locationName: string; source?: "fallback"; status: "resolved" }
  | { assistantMessage: string; status: "question" }
  | { assistantMessage: string; categoryIds: string[]; status: "choose" };

function isIntentMessage(value: unknown): value is IntentMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<IntentMessage>;
  return (
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0 &&
    (candidate.role === "assistant" || candidate.role === "user")
  );
}

function normalizeLocationName(locationName: string) {
  return locationName.trim().replace(/駅$/, "");
}

function resolveCategoryByKeyword(userText: string): PlaceCategoryConfig | null {
  const normalizedText = userText.toLowerCase();
  let bestCategory: PlaceCategoryConfig | null = null;
  let bestScore = 0;

  for (const category of Object.values(placeCategories)) {
    const score = category.keywords.reduce(
      (count, keyword) => (normalizedText.includes(keyword.toLowerCase()) ? count + 1 : count),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function resolveLocationByText(userText: string): string | null {
  const knownLocations = Array.from(
    new Set(
      Object.values(placeCategories).flatMap((category) =>
        category.places.map((place) => normalizeLocationName(place.station)),
      ),
    ),
  ).sort((a, b) => b.length - a.length);

  const knownLocation = knownLocations.find((location) => userText.includes(location));
  if (knownLocation) {
    return knownLocation;
  }

  const explicitAreaMatch = userText.match(/([一-龠々ぁ-んァ-ヶーA-Za-z0-9]+)駅(?:で|周辺|あたり|近辺|付近)?/);

  if (explicitAreaMatch?.[1]) {
    return normalizeLocationName(explicitAreaMatch[1]);
  }

  return null;
}

function resolveGroundedLocation(userText: string, llmLocationName?: string) {
  const locationByText = resolveLocationByText(userText);
  if (locationByText) {
    return locationByText;
  }

  const normalizedLlmLocation = llmLocationName ? normalizeLocationName(llmLocationName) : "";
  if (!normalizedLlmLocation) {
    return null;
  }

  const escapedLocation = normalizedLlmLocation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const locationPattern = new RegExp(`${escapedLocation}(?:駅)?`);

  return locationPattern.test(userText) ? normalizedLlmLocation : null;
}

function buildUserText(messages: IntentMessage[]) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");
}

// LLM が使えないときのキーワードフォールバック。
// カテゴリと場所の両方が取れた場合だけ resolved にする。
function resolveByKeyword(messages: IntentMessage[]): IntentResponse {
  const userText = buildUserText(messages);
  const category = resolveCategoryByKeyword(userText);
  const locationName = resolveLocationByText(userText);

  if (!category && !locationName) {
    return { assistantMessage: "どんなことを、どのあたりでしてみたいですか？", status: "question" };
  }

  if (!category) {
    return { assistantMessage: `${locationName}で、どんなお店を探したいですか？`, status: "question" };
  }

  if (!locationName) {
    return { assistantMessage: `${category.label}なら、どのあたりで探しましょうか？`, status: "question" };
  }

  return {
    activityLabel: category.label,
    categoryId: category.id,
    locationName,
    source: "fallback",
    status: "resolved",
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの JSON を解釈できませんでした" }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(rawMessages) || !rawMessages.every(isIntentMessage) || rawMessages.length === 0) {
    return NextResponse.json({ error: "messages の形式が不正です" }, { status: 400 });
  }

  const messages = rawMessages as IntentMessage[];
  if (messages[0].role !== "user") {
    return NextResponse.json({ error: "先頭は user のメッセージである必要があります" }, { status: 400 });
  }

  // これまでにアシスタントが聞き返した回数（＝アシスタント発言の数）。
  const clarifyingQuestionCount = messages.filter((message) => message.role === "assistant").length;

  const result = await resolveIntent(messages);

  if (!result) {
    // APIキー未設定・推論失敗 → キーワード判定へフォールバック。
    return NextResponse.json<IntentResponse>(resolveByKeyword(messages));
  }

  if (result.status === "question") {
    const keywordResult = resolveByKeyword(messages);
    if (keywordResult.status === "resolved") {
      return NextResponse.json<IntentResponse>(keywordResult);
    }

    // 上限に達していなければ、もう一度聞き返す。
    if (clarifyingQuestionCount < MAX_CLARIFYING_QUESTIONS) {
      return NextResponse.json<IntentResponse>({ assistantMessage: result.assistantMessage, status: "question" });
    }
    // 上限に達してもまだ曖昧なら、推測で遷移せずユーザーにカテゴリを選んでもらう。
    return NextResponse.json<IntentResponse>({
      assistantMessage: CHOOSE_MESSAGE,
      categoryIds: ALL_CATEGORY_IDS,
      status: "choose",
    });
  }

  const userLocationName = resolveGroundedLocation(buildUserText(messages), result.locationName);
  if (!userLocationName) {
    return NextResponse.json<IntentResponse>({
      assistantMessage: `${result.activityLabel}なら、どの駅の近くで探しましょうか？`,
      status: "question",
    });
  }

  return NextResponse.json<IntentResponse>({
    activityLabel: result.activityLabel,
    categoryId: result.categoryId,
    locationName: userLocationName,
    status: "resolved",
  });
}

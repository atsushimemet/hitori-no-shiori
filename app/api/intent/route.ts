import { NextResponse } from "next/server";
import { resolveIntent, type IntentMessage } from "@/lib/intentResolution";
import { resolvePlaceCategoryForMessage } from "@/lib/placeCategories";

export const dynamic = "force-dynamic";

type IntentResponse =
  | { categoryId: string; source?: "fallback"; status: "resolved" }
  | { assistantMessage: string; status: "question" };

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

// LLM が使えないとき、または聞き返しの上限を超えたときのキーワードフォールバック。
// 聞き返し後の確定にも対応できるよう、ユーザーの全発言を結合して判定する。
function resolveByKeyword(messages: IntentMessage[]): IntentResponse {
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");
  const category = resolvePlaceCategoryForMessage(userText);
  return { categoryId: category.id, source: "fallback", status: "resolved" };
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

  const hasAssistantTurn = messages.some((message) => message.role === "assistant");

  const result = await resolveIntent(messages);

  if (!result) {
    // APIキー未設定・推論失敗 → キーワード判定へフォールバック。
    return NextResponse.json<IntentResponse>(resolveByKeyword(messages));
  }

  if (result.status === "question") {
    // 聞き返しは 1 回まで。既に聞き返し済みなら強制的にカテゴリを確定させ、無限ループを防ぐ。
    if (hasAssistantTurn) {
      return NextResponse.json<IntentResponse>(resolveByKeyword(messages));
    }
    return NextResponse.json<IntentResponse>({ assistantMessage: result.assistantMessage, status: "question" });
  }

  return NextResponse.json<IntentResponse>({ categoryId: result.categoryId, status: "resolved" });
}

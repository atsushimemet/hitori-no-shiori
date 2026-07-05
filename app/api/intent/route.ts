import { NextResponse } from "next/server";
import { resolveIntent, type IntentMessage } from "@/lib/intentResolution";
import { resolvePlaceCategoryForMessage } from "@/lib/placeCategories";

export const dynamic = "force-dynamic";

// 曖昧なときの聞き返しは会話全体で最大2回まで。これを超えたら確定させ、無限ループを防ぐ。
const MAX_CLARIFYING_QUESTIONS = 2;

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

  // これまでにアシスタントが聞き返した回数（＝アシスタント発言の数）。
  const clarifyingQuestionCount = messages.filter((message) => message.role === "assistant").length;

  const result = await resolveIntent(messages);

  if (!result) {
    // APIキー未設定・推論失敗 → キーワード判定へフォールバック。
    return NextResponse.json<IntentResponse>(resolveByKeyword(messages));
  }

  if (result.status === "question") {
    // 上限に達していなければ、もう一度聞き返す。
    if (clarifyingQuestionCount < MAX_CLARIFYING_QUESTIONS) {
      return NextResponse.json<IntentResponse>({ assistantMessage: result.assistantMessage, status: "question" });
    }
    // 上限に達したら確定させる。LLM の推測カテゴリがあればそれを、無ければキーワード判定を使う。
    if (result.categoryId) {
      return NextResponse.json<IntentResponse>({ categoryId: result.categoryId, status: "resolved" });
    }
    return NextResponse.json<IntentResponse>(resolveByKeyword(messages));
  }

  return NextResponse.json<IntentResponse>({ categoryId: result.categoryId, status: "resolved" });
}

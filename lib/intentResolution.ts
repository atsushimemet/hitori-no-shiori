import Anthropic from "@anthropic-ai/sdk";
import { placeCategories, type PlaceCategoryId } from "@/lib/placeCategories";

// トップページから送られてきたユーザーの入力（会話履歴）を LLM（Claude Haiku 4.5）に渡し、
// 「今どんな気分で、何をしたいか」を読み取って 9 カテゴリのいずれかに対応づける。
// 確信できれば resolved、まだ曖昧なら question で聞き返す（上限は呼び出し側で制御）。
// question のときも最有力の推測カテゴリ（categoryId）を返し、聞き返し上限に達したときの
// 確定に使えるようにする。
// APIキー未設定・推論失敗・不正な出力のときは null を返し、呼び出し側（API ルート）が
// キーワード判定（resolvePlaceCategoryForMessage）へフォールバックする。

export type IntentMessage = {
  content: string;
  role: "assistant" | "user";
};

export type IntentResolution =
  | { activityLabel: string; categoryId: PlaceCategoryId; locationName: string; status: "resolved" }
  | { assistantMessage: string; categoryId: PlaceCategoryId | null; status: "question" };

const CATEGORY_IDS = Object.keys(placeCategories) as PlaceCategoryId[];
const UNKNOWN_CATEGORY_ID = "unknown";

function isPlaceCategoryId(value: unknown): value is PlaceCategoryId {
  return typeof value === "string" && value in placeCategories;
}

// json_schema は「status に応じて片方だけ required」を表現できないため、
// 両フィールドを required にし、番人値（question 時の categoryId、resolved 時の
// assistantMessage）はコード側で無視する運用にする。
const RESPONSE_SCHEMA = {
  additionalProperties: false,
  properties: {
    activityLabel: { type: "string" },
    assistantMessage: { type: "string" },
    categoryId: { enum: [...CATEGORY_IDS, UNKNOWN_CATEGORY_ID], type: "string" },
    locationName: { type: "string" },
    status: { enum: ["resolved", "question"], type: "string" },
  },
  required: ["status", "categoryId", "assistantMessage", "activityLabel", "locationName"],
  type: "object",
};

function buildSystemPrompt(): string {
  const categoryList = Object.values(placeCategories)
    .map((category) => `- ${category.id}（${category.label}）: ${category.description}`)
    .join("\n");

  return [
    "あなたは、ひとりの休日の過ごし方に迷っている人へ、行き先のお店を提案する案内役です。",
    "ユーザーとの会話から「何をしたいか」と「どの駅の近くで探したいか」を読み取り、次の 9 カテゴリのうち最も合う 1 つに対応づけてください。",
    "",
    categoryList,
    "",
    "判定のルール:",
    "- 「何をしたいか」と「駅名」の両方がユーザー発話に明示され、カテゴリを 1 つに絞れるなら status を \"resolved\" にしてください。",
    "- resolved のときは categoryId、activityLabel（例: 本屋、カジュアルバー）、locationName（例: 神保町、渋谷）を入れてください。",
    "- ユーザーが駅名質問に「新宿」「渋谷」のように駅なしで短く答えた場合も、駅名として locationName に入れてください。",
    "- カテゴリ説明、候補店舗、過去の代表エリアから駅名を推測してはいけません。",
    "- 「何をしたいか」または「駅名」のどちらかが足りないときは、status を \"question\" にし、assistantMessage に日本語の短い聞き返しを 1 文だけ入れてください。",
    "- question のとき、カテゴリが推測できない場合は categoryId を \"unknown\" にしてください。",
    "- 既に聞き返しをしている場合は、前の質問と重複しない、足りない情報だけを聞いてください。",
    "",
    "出力の補足:",
    "- status が \"resolved\" のとき assistantMessage は空文字にしてください。",
    "- status が \"question\" のとき activityLabel と locationName は空文字にしてください。",
  ].join("\n");
}

export async function resolveIntent(messages: IntentMessage[]): Promise<IntentResolution | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY が未設定のため、意図判定をキーワードにフォールバックします");
    return null;
  }

  if (messages.length === 0) {
    return null;
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      max_tokens: 512,
      messages: messages.map((message) => ({ content: message.content, role: message.role })),
      model: "claude-haiku-4-5",
      output_config: { format: { schema: RESPONSE_SCHEMA, type: "json_schema" } },
      system: buildSystemPrompt(),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return null;
    }

    const parsed = JSON.parse(textBlock.text) as {
      activityLabel?: unknown;
      assistantMessage?: unknown;
      categoryId?: unknown;
      locationName?: unknown;
      status?: unknown;
    };

    console.log(
      `意図判定: Claude 使用量 input=${response.usage.input_tokens} / output=${response.usage.output_tokens} tokens`,
    );

    if (
      parsed.status === "resolved" &&
      isPlaceCategoryId(parsed.categoryId) &&
      typeof parsed.activityLabel === "string" &&
      parsed.activityLabel.trim() &&
      typeof parsed.locationName === "string" &&
      parsed.locationName.trim()
    ) {
      console.log(`意図判定: カテゴリを「${parsed.categoryId}」に確定しました`);
      return {
        activityLabel: parsed.activityLabel.trim(),
        categoryId: parsed.categoryId,
        locationName: parsed.locationName.trim().replace(/駅$/, ""),
        status: "resolved",
      };
    }

    if (parsed.status === "question" && typeof parsed.assistantMessage === "string" && parsed.assistantMessage.trim()) {
      console.log("意図判定: 聞き返しを行います");
      return {
        assistantMessage: parsed.assistantMessage.trim(),
        categoryId: isPlaceCategoryId(parsed.categoryId) ? parsed.categoryId : null,
        status: "question",
      };
    }

    return null;
  } catch (error) {
    console.error("意図判定の推論に失敗しました", error);
    return null;
  }
}

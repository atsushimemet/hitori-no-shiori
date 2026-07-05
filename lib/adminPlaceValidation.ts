import type { AdminPlaceInput } from "@/lib/adminPlaces";

type ParseResult =
  | { ok: true; value: AdminPlaceInput }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requireString(body: Record<string, unknown>, key: string, label: string) {
  const value = body[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label}を入力してください。`);
  }

  return value.trim();
}

function optionalString(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

function parseStringArray(value: unknown, label: string) {
  if (!Array.isArray(value)) {
    throw new Error(`${label}の形式が不正です。`);
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAttributes(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("属性の形式が不正です。");
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, item]) => [key.trim(), item.trim()])
      .filter(([key]) => Boolean(key)),
  );
}

export function parseAdminPlaceInput(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, error: "入力内容の形式が不正です。" };
  }

  try {
    const walkMinutes = Number(value.walkMinutes);

    if (!Number.isInteger(walkMinutes) || walkMinutes < 0 || walkMinutes > 180) {
      throw new Error("徒歩分数は0から180の整数で入力してください。");
    }

    return {
      ok: true,
      value: {
        attributes: parseAttributes(value.attributes),
        categoryId: requireString(value, "categoryId", "カテゴリ"),
        googleMapUrl: requireString(value, "googleMapUrl", "Google Map URL"),
        instagramUrl: optionalString(value, "instagramUrl"),
        isPublished: value.isPublished === true,
        name: requireString(value, "name", "店名"),
        paymentMethods: parseStringArray(value.paymentMethods, "決済方法"),
        recommendedArticle: requireString(value, "recommendedArticle", "おすすめ記事"),
        recommendedArticleUrl: optionalString(value, "recommendedArticleUrl"),
        seatInfo: requireString(value, "seatInfo", "席情報"),
        station: requireString(value, "station", "最寄り駅"),
        walkMinutes,
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "入力内容が不正です。" };
  }
}

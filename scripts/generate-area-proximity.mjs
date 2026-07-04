// ============================================================================
// エリア近接マップ生成スクリプト（ビルド時ツール / build-time only）
// ----------------------------------------------------------------------------
// Supabase の places.station を読み、Claude（claude-opus-4-8）に東京の地理的近さを
// もとにした「駅→エリア」「エリア→近隣エリア」のマッピングを算出させ、
// lib/areaProximity.ts を再生成する。
//
// このスクリプトはアプリのランタイムでは一切読み込まれない。店舗の駅が増減したとき
// などに、開発者が手元で実行して lib/areaProximity.ts を更新するためのもの。
//
// 実行方法:
//   npm install -D @anthropic-ai/sdk        # 生成時のみ必要（本番依存には入れない）
//   ANTHROPIC_API_KEY=... SUPABASE_URL=... SUPABASE_ANON_KEY=... \
//     node scripts/generate-area-proximity.mjs
//
// SUPABASE_URL / SUPABASE_ANON_KEY が無い場合は、駅一覧を標準入力(JSON配列)から読む。
// ============================================================================

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const OUTPUT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "lib",
  "areaProximity.ts",
);

async function loadStations() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (url && anonKey) {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.from("places").select("station");
    if (error) {
      throw new Error(`Supabaseからの駅取得に失敗しました: ${error.message}`);
    }
    return [...new Set((data ?? []).map((row) => row.station).filter(Boolean))].sort();
  }

  // 環境変数が無い場合は標準入力（JSON配列）から駅一覧を読む。
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8") || "[]");
  return [...new Set(parsed)].sort();
}

const SYSTEM_PROMPT = [
  "あなたは東京の鉄道路線と街の地理に精通したアシスタントです。",
  "与えられた駅名のリストをもとに、次の2つのマッピングをJSONで返してください。",
  "1. areaByStation: 各駅を広域エリア名に対応づける。徒歩圏でひとつの街として扱える駅は同じエリアにまとめる（例：銀座駅・銀座一丁目駅・東銀座駅→「銀座」、神保町駅・御茶ノ水駅・小川町駅→「神保町」）。",
  "2. nearbyAreas: areaByStation に登場する各エリアについて、地理的に近い順の近隣エリア名の配列。実在の近隣エリアを4件程度含める。リストに無いエリアでもよい。",
  "エリア名・駅名は日本語のまま。JSON以外の文字は出力しないこと。",
].join("\n");

function buildOutput({ areaByStation, nearbyAreas }) {
  const stationEntries = Object.entries(areaByStation)
    .map(([station, area]) => `  ${station}: ${JSON.stringify(area)},`)
    .join("\n");
  const nearbyEntries = Object.entries(nearbyAreas)
    .map(([area, list]) => `  ${JSON.stringify(area)}: ${JSON.stringify(list)},`)
    .join("\n");

  return `// ============================================================================
// エリア近接マップ（ビルド時に生成 / Generated at build time）
// scripts/generate-area-proximity.mjs で再生成される。手で編集する場合は
// スクリプトのプロンプトも合わせて更新すること。
// ============================================================================

export const AREA_BY_STATION: Record<string, string> = {
${stationEntries}
};

export const NEARBY_AREAS: Record<string, string[]> = {
${nearbyEntries}
};

export function resolveArea(station: string): string {
  const trimmed = station.trim();

  return AREA_BY_STATION[trimmed] ?? trimmed.replace(/駅$/, "");
}

export function getNearbyAreas(area: string): string[] {
  return NEARBY_AREAS[area] ?? [];
}
`;
}

async function main() {
  const stations = await loadStations();
  if (stations.length === 0) {
    throw new Error("駅一覧が空です。SUPABASE_URL/SUPABASE_ANON_KEY か標準入力を確認してください。");
  }
  console.info(`[生成] ${stations.length}件の駅からエリア近接マップを算出します。`);

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `駅一覧: ${JSON.stringify(stations)}\n\nJSONは {"areaByStation": {...}, "nearbyAreas": {...}} の形で返してください。`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json);

  await writeFile(OUTPUT_PATH, buildOutput(parsed), "utf8");
  console.info(`[生成] ${OUTPUT_PATH} を更新しました。`);
}

main().catch((error) => {
  console.error("[生成] 失敗しました:", error);
  process.exit(1);
});

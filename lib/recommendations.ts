import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase";
import { placeCategories, type Place } from "@/lib/placeCategories";

// 予定に組み込んだ店舗の駅を起点に、「同じ路線沿いの別の駅」にある店舗をレコメンドする。
// 駅名の路線判定は LLM（Claude Haiku 4.5）に委ねる。
// 既知のカタログ駅だけは軽量な停車路線リストで検証し、近隣駅や誤った路線名を除外する。
// LLM への課金を抑えるため、起点駅ごとに判定結果をプロセス内キャッシュする。

export type RecommendedPlace = {
  categoryLabel: string;
  googleMapUrl: string;
  instagramUrl?: string;
  line: string;
  name: string;
  recommendedArticle: string;
  recommendedArticleUrl?: string;
  station: string;
  walkMinutes: number;
};

type CandidatePlace = Omit<RecommendedPlace, "line">;

type LineMatch = {
  line: string;
  station: string;
};

const KNOWN_STATION_LINES = new Map<string, string[]>([
  ["神保町駅", ["半蔵門線", "都営三田線", "都営新宿線"]],
  ["御茶ノ水駅", ["JR中央線", "JR中央・総武線", "丸ノ内線"]],
  ["恵比寿駅", ["JR山手線", "JR埼京線", "JR湘南新宿ライン", "日比谷線"]],
  ["代々木上原駅", ["小田急小田原線", "千代田線"]],
  ["代々木公園駅", ["千代田線"]],
  ["代々木八幡駅", ["小田急小田原線"]],
  ["下北沢駅", ["小田急小田原線", "京王井の頭線"]],
  ["上野駅", ["JR山手線", "JR京浜東北線", "JR高崎線", "JR宇都宮線", "銀座線", "日比谷線"]],
  ["新宿駅", ["JR山手線", "JR中央線", "JR総武線", "小田急小田原線", "京王線", "丸ノ内線", "都営新宿線", "都営大江戸線"]],
  ["銀座駅", ["銀座線", "丸ノ内線", "日比谷線"]],
  ["銀座一丁目駅", ["有楽町線"]],
  ["東銀座駅", ["日比谷線", "都営浅草線"]],
  ["水道橋駅", ["JR中央・総武線", "都営三田線"]],
  ["九段下駅", ["東西線", "半蔵門線", "都営新宿線"]],
  ["小川町駅", ["都営新宿線"]],
  ["高円寺駅", ["JR中央線", "JR中央・総武線"]],
  ["阿佐ヶ谷駅", ["JR中央線", "JR中央・総武線"]],
  ["幡ヶ谷駅", ["京王新線"]],
]);

// 起点駅 -> 同一路線と判定された駅の一覧（LLM 呼び出し結果）をキャッシュする。
const lineMatchCache = new Map<string, LineMatch[]>();

function readCategoryLabel(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0] as { label?: string } | undefined;
    return first?.label ?? "お店";
  }

  if (value && typeof value === "object") {
    return (value as { label?: string }).label ?? "お店";
  }

  return "お店";
}

async function loadCandidatePlaces(): Promise<CandidatePlace[]> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("places")
      .select(
        "name, station, walk_minutes, google_map_url, recommended_article, recommended_article_url, instagram_url, place_categories(label)",
      )
      .eq("is_published", true);

    if (!error && data) {
      return (data as Record<string, unknown>[]).map((row) => ({
        categoryLabel: readCategoryLabel(row.place_categories),
        googleMapUrl: (row.google_map_url as string) ?? "",
        instagramUrl: (row.instagram_url as string | null) ?? undefined,
        name: row.name as string,
        recommendedArticle: (row.recommended_article as string) ?? "",
        recommendedArticleUrl: (row.recommended_article_url as string | null) ?? undefined,
        station: row.station as string,
        walkMinutes: (row.walk_minutes as number) ?? 0,
      }));
    }

    console.error("店舗一覧の取得に失敗したため、内蔵データにフォールバックします", error);
  }

  // Supabase 未設定・取得失敗時は静的カタログを候補にする。
  return Object.values(placeCategories).flatMap((category) =>
    (category.places as Place[]).map((place) => ({
      categoryLabel: category.label,
      googleMapUrl: place.googleMapUrl ?? place.mapUrl ?? "",
      instagramUrl: place.instagramUrl,
      name: place.name,
      recommendedArticle: place.recommendedArticle,
      recommendedArticleUrl: place.recommendedArticleUrl,
      station: place.station,
      walkMinutes: place.walkMinutes,
    })),
  );
}

const RESPONSE_SCHEMA = {
  additionalProperties: false,
  properties: {
    matches: {
      items: {
        additionalProperties: false,
        properties: {
          line: { type: "string" },
          station: { type: "string" },
        },
        required: ["line", "station"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["matches"],
  type: "object",
} as const;

function getKnownStationLines(station: string): string[] | undefined {
  return KNOWN_STATION_LINES.get(station) ?? KNOWN_STATION_LINES.get(`${station}駅`);
}

function findKnownSharedLine(originStation: string, candidateStation: string): string | null {
  const originLines = getKnownStationLines(originStation);
  const candidateLines = getKnownStationLines(candidateStation);

  if (!originLines || !candidateLines) {
    return null;
  }

  return originLines.find((line) => candidateLines.includes(line)) ?? null;
}

async function resolveLineMatches(
  originStation: string,
  candidateStations: string[],
): Promise<LineMatch[]> {
  const cached = lineMatchCache.get(originStation);
  if (cached) {
    console.log(`路線レコメンド: キャッシュを利用しました（起点駅=${originStation}）`);
    return cached;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY が未設定のため、路線レコメンドをスキップします");
    return [];
  }

  const prompt = [
    `起点の駅は「${originStation}」です。`,
    "以下は候補となる駅の一覧です:",
    candidateStations.map((station) => `- ${station}`).join("\n"),
    "",
    `これらの候補駅のうち、「${originStation}」と同じ鉄道路線上にある駅だけを選んでください。`,
    "ここでの「同じ鉄道路線」は、起点駅と候補駅の両方に同じ路線が正式に停車することを意味します。",
    "徒歩連絡できる近隣駅、同じエリアの別駅、乗り換えが必要な駅、直通運転だけで路線名が変わる駅は含めないでください。",
    "line には起点駅と候補駅の両方に正式停車する共有路線名だけを入れてください。",
    "例: 銀座駅と東銀座駅は日比谷線で共有。銀座駅と神保町駅は共有路線が無いので不可。神保町駅と御茶ノ水駅も共有路線が無いので不可。",
    "実在する東京の鉄道路線の知識にもとづいて判断し、選んだ駅名と、共有している路線名を1つずつ matches に入れて JSON で返してください。",
    "同じ路線が存在しない駅は含めないでください。候補一覧に無い駅は返さないでください。",
  ].join("\n");

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ content: prompt, role: "user" }],
      model: "claude-haiku-4-5",
      output_config: { format: { schema: RESPONSE_SCHEMA, type: "json_schema" } },
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return [];
    }

    const candidateSet = new Set(candidateStations);
    const parsed = JSON.parse(textBlock.text) as { matches?: LineMatch[] };
    const matches = (parsed.matches ?? []).flatMap((match) => {
      if (!match || typeof match.station !== "string" || !candidateSet.has(match.station)) {
        return [];
      }

      const originLines = getKnownStationLines(originStation);
      const candidateLines = getKnownStationLines(match.station);

      if (!originLines || !candidateLines) {
        const knownLines = originLines ?? candidateLines;
        return !knownLines || knownLines.includes(match.line) ? match : [];
      }

      const sharedLine = findKnownSharedLine(originStation, match.station);
      return sharedLine ? { line: sharedLine, station: match.station } : [];
    });

    lineMatchCache.set(originStation, matches);
    console.log(
      `路線レコメンド: ${originStation} と同一路線の駅を ${matches.length} 件判定しました`,
    );
    console.log(
      `路線レコメンド: Claude 使用量 input=${response.usage.input_tokens} / output=${response.usage.output_tokens} tokens`,
    );
    return matches;
  } catch (error) {
    console.error("路線レコメンドの推論に失敗しました", error);
    return [];
  }
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export async function getLineRecommendations(params: {
  limit?: number;
  station: string;
}): Promise<RecommendedPlace[]> {
  const originStation = params.station.trim();
  const limit = params.limit ?? 3;

  if (!originStation) {
    return [];
  }

  const allPlaces = await loadCandidatePlaces();
  // 起点駅そのものは除外し、「路線内の別の駅」だけを候補にする。
  const candidates = allPlaces.filter((place) => place.station !== originStation);
  const candidateStations = Array.from(new Set(candidates.map((place) => place.station)));

  if (candidateStations.length === 0) {
    return [];
  }

  const matches = await resolveLineMatches(originStation, candidateStations);
  if (matches.length === 0) {
    return [];
  }

  const lineByStation = new Map(matches.map((match) => [match.station, match.line]));
  const seen = new Set<string>();
  const results: RecommendedPlace[] = [];

  for (const place of shuffle(candidates)) {
    const line = lineByStation.get(place.station);
    if (!line) {
      continue;
    }

    const key = `${place.name}@${place.station}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push({ ...place, line });
  }

  return results.slice(0, limit);
}

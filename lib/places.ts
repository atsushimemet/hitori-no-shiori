import { createSupabaseServerClient } from "@/lib/supabase";
import type { Place, PlaceAttributeDefinition, PlaceCategoryConfig } from "@/lib/placeCategories";

// 駅名一致で抽出するため、カテゴリの全公開店舗を取得する上限。
const SUPPLEMENT_FETCH_LIMIT = 100;

type PlaceCategoryRow = {
  assistant_list_message: string;
  assistant_question: string;
  attribute_schema: PlaceAttributeDefinition[] | null;
  calendar_place_label: string;
  description: string;
  heading: string;
  id: string;
  interest_target: string;
  keywords: string[] | null;
  label: string;
  route: string;
  select_prompt: string;
  slug: string;
  time_options: string[] | null;
  time_placeholder: string;
};

type RandomPlaceRow = {
  attributes: Record<string, string> | null;
  google_map_url: string;
  id: string;
  instagram_url: string | null;
  name: string;
  payment_methods: string[] | null;
  recommended_article: string;
  recommended_article_url: string | null;
  seat_info: string;
  station: string;
  walk_minutes: number;
};

type PlacePayload = {
  category: PlaceCategoryRow | null;
  places: RandomPlaceRow[] | null;
};

function toPlace(row: RandomPlaceRow): Place {
  return {
    attributes: row.attributes ?? {},
    googleMapUrl: row.google_map_url,
    id: row.id,
    instagramUrl: row.instagram_url ?? "",
    name: row.name,
    paymentMethods: row.payment_methods ?? [],
    recommendedArticle: row.recommended_article,
    recommendedArticleUrl: row.recommended_article_url ?? "",
    seatInfo: row.seat_info,
    station: row.station,
    walkMinutes: row.walk_minutes,
  };
}

function mergeCategory(fallback: PlaceCategoryConfig, row: PlaceCategoryRow): PlaceCategoryConfig {
  return {
    ...fallback,
    assistantListMessage: row.assistant_list_message,
    assistantQuestion: row.assistant_question,
    attributeSchema: row.attribute_schema ?? [],
    calendarPlaceLabel: row.calendar_place_label,
    description: row.description,
    heading: row.heading,
    interestTarget: row.interest_target,
    keywords: row.keywords ?? fallback.keywords,
    label: row.label,
    route: row.route,
    selectPrompt: row.select_prompt,
    timeOptions: row.time_options ?? fallback.timeOptions,
    timePlaceholder: row.time_placeholder,
  };
}

function normalizeStationName(station: string) {
  return station.trim().replace(/駅$/, "");
}

// ユーザーがヒアリングで確定した駅名に一致する店舗だけを採用する。
// 駅名未指定・一致店舗なしの場合は、モック用の代表エリアへフォールバックしない。
export function selectPlacesByStation(
  places: Place[],
  stationName: string | undefined,
  limitCount: number,
): Place[] {
  const normalizedStationName = stationName ? normalizeStationName(stationName) : "";

  if (limitCount <= 0 || places.length === 0 || !normalizedStationName) {
    return [];
  }

  return places
    .filter((place) => normalizeStationName(place.station) === normalizedStationName)
    .slice(0, limitCount);
}

export async function getRandomPlacesByCategorySlug(
  fallback: PlaceCategoryConfig,
  limitCount = 3,
  stationName?: string,
): Promise<PlaceCategoryConfig> {
  const supabase = createSupabaseServerClient();

  // Supabase 未接続時も、駅名未指定なら代表エリアへフォールバックしない。
  if (!supabase) {
    return {
      ...fallback,
      places: selectPlacesByStation(fallback.places, stationName, limitCount),
    };
  }

  // 駅名一致判定のためカテゴリの全公開店舗を取得してから、指定件数を選抜する。
  const { data, error } = await supabase.rpc("get_random_places_by_category", {
    category_slug: fallback.slug,
    limit_count: SUPPLEMENT_FETCH_LIMIT,
  });

  if (error || !data) {
    console.error("Supabaseからの店舗取得に失敗しました", error);
    return { ...fallback, places: [] };
  }

  const payload = data as PlacePayload;

  if (!payload.category) {
    return { ...fallback, places: [] };
  }

  const category = mergeCategory(fallback, payload.category);
  const allPlaces = (payload.places ?? []).map(toPlace);

  return {
    ...category,
    places: selectPlacesByStation(allPlaces, stationName, limitCount),
  };
}

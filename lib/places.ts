import { createSupabaseServerClient } from "@/lib/supabase";
import { getNearbyAreas, resolveArea } from "@/lib/areaProximity";
import type { Place, PlaceAttributeDefinition, PlaceCategoryConfig } from "@/lib/placeCategories";

// 補完判定のため、指定件数だけでなくカテゴリの全公開店舗を取得する上限。
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

function placeKey(place: Place, index: number): string {
  return place.id ?? `${place.name}-${index}`;
}

// 指定エリアの店舗を優先して採用し、limitCount 件に満たない場合は
// 近隣エリアから近い順で補完する。補完された店舗には isSupplemented: true を付ける。
export function selectPlacesWithSupplement(
  places: Place[],
  area: string,
  limitCount: number,
  categoryLabel: string,
): Place[] {
  if (limitCount <= 0 || places.length === 0) {
    return [];
  }

  const used = new Set<string>();
  const selected: Place[] = [];

  // 1. 指定エリアの店舗をそのまま採用する。
  places.forEach((place, index) => {
    if (selected.length >= limitCount) {
      return;
    }
    if (resolveArea(place.station) === area) {
      used.add(placeKey(place, index));
      selected.push({ ...place, isSupplemented: false });
    }
  });

  const primaryCount = selected.length;

  // 2. 指定エリアが limitCount 件未満なら、近隣エリアから近い順に補完する。
  if (selected.length < limitCount) {
    for (const nearbyArea of getNearbyAreas(area)) {
      if (selected.length >= limitCount) {
        break;
      }
      places.forEach((place, index) => {
        const key = placeKey(place, index);
        if (selected.length >= limitCount || used.has(key)) {
          return;
        }
        if (resolveArea(place.station) === nearbyArea) {
          used.add(key);
          selected.push({ ...place, isSupplemented: true });
        }
      });
    }

    // 3. 近隣マップに載っていないエリアの店舗しか残っていない場合も、
    //    画面が空にならないよう最終手段として補完扱いで埋める。
    places.forEach((place, index) => {
      const key = placeKey(place, index);
      if (selected.length >= limitCount || used.has(key)) {
        return;
      }
      used.add(key);
      selected.push({ ...place, isSupplemented: true });
    });
  }

  const supplementedCount = selected.length - primaryCount;
  if (supplementedCount > 0) {
    console.info(
      `[補完] ${categoryLabel}：指定エリア「${area}」の店舗が${primaryCount}件のため、近隣エリアから${supplementedCount}件補完しました。`,
    );
  }

  return selected;
}

export async function getRandomPlacesByCategorySlug(
  fallback: PlaceCategoryConfig,
  limitCount = 3,
): Promise<PlaceCategoryConfig> {
  const supabase = createSupabaseServerClient();

  // Supabase 未接続時はカテゴリ定義のモック店舗にも補完ロジックを適用する。
  if (!supabase) {
    return {
      ...fallback,
      places: selectPlacesWithSupplement(fallback.places, fallback.area, limitCount, fallback.label),
    };
  }

  // 補完判定のためカテゴリの全公開店舗を取得してから、指定件数を選抜する。
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
    places: selectPlacesWithSupplement(allPlaces, category.area, limitCount, category.label),
  };
}

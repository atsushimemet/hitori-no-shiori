import { createSupabaseServerClient } from "@/lib/supabase";
import type { Place, PlaceAttributeDefinition, PlaceCategoryConfig } from "@/lib/placeCategories";

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

export async function getRandomPlacesByCategorySlug(
  fallback: PlaceCategoryConfig,
  limitCount = 3,
): Promise<PlaceCategoryConfig> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallback;
  }

  const { data, error } = await supabase.rpc("get_random_places_by_category", {
    category_slug: fallback.slug,
    limit_count: limitCount,
  });

  if (error || !data) {
    console.error("Failed to fetch places from Supabase", error);
    return { ...fallback, places: [] };
  }

  const payload = data as PlacePayload;

  if (!payload.category) {
    return { ...fallback, places: [] };
  }

  return {
    ...mergeCategory(fallback, payload.category),
    places: (payload.places ?? []).map(toPlace),
  };
}

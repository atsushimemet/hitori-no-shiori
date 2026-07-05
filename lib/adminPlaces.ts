import { createSupabaseAdminClient } from "@/lib/supabase";

export type AdminCategory = {
  id: string;
  label: string;
  slug: string;
};

export type AdminPlace = {
  attributes: Record<string, string>;
  categoryId: string;
  categoryLabel: string;
  googleMapUrl: string;
  id: string;
  instagramUrl: string;
  isPublished: boolean;
  name: string;
  paymentMethods: string[];
  recommendedArticle: string;
  recommendedArticleUrl: string;
  seatInfo: string;
  station: string;
  updatedAt: string;
  walkMinutes: number;
};

type PlaceRow = {
  attributes: Record<string, string> | null;
  category_id: string;
  google_map_url: string;
  id: string;
  instagram_url: string | null;
  is_published: boolean;
  name: string;
  payment_methods: string[] | null;
  place_categories: { label: string } | { label: string }[] | null;
  recommended_article: string;
  recommended_article_url: string | null;
  seat_info: string;
  station: string;
  updated_at: string;
  walk_minutes: number;
};

export type AdminPlaceInput = {
  attributes: Record<string, string>;
  categoryId: string;
  googleMapUrl: string;
  instagramUrl: string | null;
  isPublished: boolean;
  name: string;
  paymentMethods: string[];
  recommendedArticle: string;
  recommendedArticleUrl: string | null;
  seatInfo: string;
  station: string;
  walkMinutes: number;
};

function categoryLabel(row: PlaceRow) {
  const category = Array.isArray(row.place_categories) ? row.place_categories[0] : row.place_categories;
  return category?.label ?? "未分類";
}

function toAdminPlace(row: PlaceRow): AdminPlace {
  return {
    attributes: row.attributes ?? {},
    categoryId: row.category_id,
    categoryLabel: categoryLabel(row),
    googleMapUrl: row.google_map_url,
    id: row.id,
    instagramUrl: row.instagram_url ?? "",
    isPublished: row.is_published,
    name: row.name,
    paymentMethods: row.payment_methods ?? [],
    recommendedArticle: row.recommended_article,
    recommendedArticleUrl: row.recommended_article_url ?? "",
    seatInfo: row.seat_info,
    station: row.station,
    updatedAt: row.updated_at,
    walkMinutes: row.walk_minutes,
  };
}

export async function getAdminPlaceData() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const [categoriesResult, placesResult] = await Promise.all([
    supabase
      .from("place_categories")
      .select("id, label, slug")
      .order("label", { ascending: true }),
    supabase
      .from("places")
      .select(
        "id, category_id, name, station, walk_minutes, google_map_url, seat_info, recommended_article, recommended_article_url, instagram_url, attributes, payment_methods, is_published, updated_at, place_categories(label)",
      )
      .order("updated_at", { ascending: false }),
  ]);

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }

  if (placesResult.error) {
    throw placesResult.error;
  }

  return {
    categories: (categoriesResult.data ?? []) as AdminCategory[],
    places: ((placesResult.data ?? []) as PlaceRow[]).map(toAdminPlace),
  };
}

export async function createAdminPlace(input: AdminPlaceInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const { data, error } = await supabase
    .from("places")
    .insert(toPlaceRow(input))
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAdminPlace(id: string, input: AdminPlaceInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const { error } = await supabase.from("places").update(toPlaceRow(input)).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminPlace(id: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const { error } = await supabase.from("places").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

function toPlaceRow(input: AdminPlaceInput) {
  return {
    attributes: input.attributes,
    category_id: input.categoryId,
    google_map_url: input.googleMapUrl,
    instagram_url: input.instagramUrl,
    is_published: input.isPublished,
    name: input.name,
    payment_methods: input.paymentMethods,
    recommended_article: input.recommendedArticle,
    recommended_article_url: input.recommendedArticleUrl,
    seat_info: input.seatInfo,
    station: input.station,
    walk_minutes: input.walkMinutes,
  };
}

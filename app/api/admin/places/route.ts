import { NextResponse } from "next/server";
import { createAdminPlace, getAdminPlaceData } from "@/lib/adminPlaces";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { parseAdminPlaceInput } from "@/lib/adminPlaceValidation";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "管理DB接続が未設定です。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。" },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(await getAdminPlaceData());
  } catch (error) {
    console.error("管理店舗データの取得に失敗しました", error);
    return NextResponse.json(
      { error: getAdminApiErrorMessage(error, "管理店舗データの取得に失敗しました。") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "管理DB接続が未設定です。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。" },
      { status: 503 },
    );
  }

  const parsed = parseAdminPlaceInput(await request.json().catch(() => null));

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await createAdminPlace(parsed.value);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("店舗の作成に失敗しました", error);
    return NextResponse.json(
      { error: getAdminApiErrorMessage(error, "店舗の作成に失敗しました。") },
      { status: 500 },
    );
  }
}

function getAdminApiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return `${fallback} ${error.message}`;
  }

  return fallback;
}

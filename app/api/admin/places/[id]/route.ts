import { NextResponse } from "next/server";
import { deleteAdminPlace, updateAdminPlace } from "@/lib/adminPlaces";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { parseAdminPlaceInput } from "@/lib/adminPlaceValidation";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "管理DB接続が未設定です。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。" },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const parsed = parseAdminPlaceInput(await request.json().catch(() => null));

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await updateAdminPlace(id, parsed.value);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("店舗の更新に失敗しました", error);
    return NextResponse.json(
      { error: getAdminApiErrorMessage(error, "店舗の更新に失敗しました。") },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "管理DB接続が未設定です。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。" },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  try {
    await deleteAdminPlace(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("店舗の削除に失敗しました", error);
    return NextResponse.json(
      { error: getAdminApiErrorMessage(error, "店舗の削除に失敗しました。") },
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

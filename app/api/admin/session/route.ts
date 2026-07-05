import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminSessionMaxAge,
  hasAdminConfig,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasAdminConfig()) {
    return NextResponse.json({ error: "管理者認証が未設定です。" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "パスワードが違います。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    httpOnly: true,
    maxAge: getAdminSessionMaxAge(),
    name: getAdminCookieName(),
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    value: createAdminSessionToken(),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: getAdminCookieName(),
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    value: "",
  });

  return response;
}

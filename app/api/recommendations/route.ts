import { NextResponse } from "next/server";
import { getLineRecommendations } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station")?.trim() ?? "";

  if (!station) {
    return NextResponse.json({ recommendations: [] });
  }

  const recommendations = await getLineRecommendations({ limit: 3, station });

  return NextResponse.json({ recommendations });
}

import { NextRequest, NextResponse } from "next/server";
import { searchGuides } from "@/entities/guide/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = (searchParams.get("q") ?? "").slice(0, 100);
  const excludeIdRaw = searchParams.get("excludeId");
  const excludeId = excludeIdRaw ? Number(excludeIdRaw) : undefined;

  if (excludeId !== undefined && (Number.isNaN(excludeId) || excludeId <= 0)) {
    return NextResponse.json([]);
  }

  try {
    const guides = await searchGuides(query, excludeId);
    return NextResponse.json(guides);
  } catch (error) {
    console.error("GET /api/guides/search failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}

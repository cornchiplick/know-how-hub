import { NextResponse } from "next/server";
import { searchTags } from "@/entities/tag/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    const tags = await searchTags(query);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}

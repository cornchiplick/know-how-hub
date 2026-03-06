import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json(null, { status: 404 });
  }

  try {
    const guide = await prisma.guide.findUnique({
      where: { id: numId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!guide) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error("GET /api/guides/[id] failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

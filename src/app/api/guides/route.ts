import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/shared/lib/api-auth";
import { markdownToTiptapJson } from "@/shared/lib/markdown-to-tiptap";
import { tiptapJsonToMarkdown } from "@/features/guide/lib/toMarkdown";
import { findOrCreateTags } from "@/entities/tag";

/** GET /api/guides - 전체 목록 조회 (공개) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    const guides = await prisma.guide.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: format === "markdown" ? true : false,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (format === "markdown") {
      const result = guides.map((g) => ({
        ...g,
        content: tiptapJsonToMarkdown(g.content as string),
      }));
      return NextResponse.json(result);
    }

    return NextResponse.json(guides);
  } catch (error) {
    console.error("GET /api/guides failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/guides - 마크다운으로 가이드 생성 (인증 필수) */
export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { title, content, tags: tagNames } = body as {
      title?: string;
      content?: string;
      tags?: string[];
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: "content (markdown) is required." }, { status: 400 });
    }

    const tiptapContent = markdownToTiptapJson(content);
    const tagIds = tagNames && tagNames.length > 0 ? await findOrCreateTags(tagNames) : [];

    const guide = await prisma.guide.create({
      data: {
        title: title.trim(),
        content: tiptapContent,
        tags:
          tagIds.length > 0
            ? { connect: tagIds.map((id) => ({ id })) }
            : undefined,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        tags: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json(guide, { status: 201 });
  } catch (error) {
    console.error("POST /api/guides failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

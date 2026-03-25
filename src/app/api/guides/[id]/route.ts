import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/shared/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/shared/lib/api-auth";
import { markdownToTiptapJson } from "@/shared/lib/markdown-to-tiptap";
import { tiptapJsonToMarkdown } from "@/features/guide/lib/toMarkdown";
import { findOrCreateTags } from "@/entities/tag";

const ATTACHMENT_DIR = path.join(process.cwd(), "datas", "attachments");

type RouteParams = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** GET /api/guides/:id - 개별 가이드 조회 (공개) */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const numId = parseId(id);
  if (!numId) {
    return NextResponse.json({ error: "Invalid guide ID" }, { status: 404 });
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
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "markdown") {
      return NextResponse.json({
        ...guide,
        content: tiptapJsonToMarkdown(guide.content),
      });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error("GET /api/guides/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** PUT /api/guides/:id - 마크다운으로 가이드 수정 (인증 필수) */
export async function PUT(request: Request, { params }: RouteParams) {
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const numId = parseId(id);
  if (!numId) {
    return NextResponse.json({ error: "Invalid guide ID" }, { status: 404 });
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

    const guide = await prisma.guide.update({
      where: { id: numId },
      data: {
        title: title.trim(),
        content: tiptapContent,
        tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
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

    return NextResponse.json(guide);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    console.error("PUT /api/guides/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE /api/guides/:id - 가이드 삭제 (인증 필수) */
export async function DELETE(request: Request, { params }: RouteParams) {
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const numId = parseId(id);
  if (!numId) {
    return NextResponse.json({ error: "Invalid guide ID" }, { status: 404 });
  }

  try {
    const attachments = await prisma.attachment.findMany({
      where: { guideId: numId },
      select: { filename: true },
    });

    await prisma.guide.delete({ where: { id: numId } });

    for (const att of attachments) {
      try {
        await unlink(path.join(ATTACHMENT_DIR, att.filename));
      } catch {
        // 파일이 이미 없을 수 있음
      }
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    console.error("DELETE /api/guides/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

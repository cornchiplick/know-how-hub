import { NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/shared/lib/prisma";

const ATTACHMENT_DIR = path.join(process.cwd(), "datas", "attachments");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // 경로 탐색 공격 방지
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json(
      { error: "잘못된 파일명입니다." },
      { status: 400 },
    );
  }

  const filePath = path.join(ATTACHMENT_DIR, filename);

  // DB에서 원본 파일명 조회
  const attachment = await prisma.attachment.findFirst({
    where: { filename },
    select: { originalName: true, mimeType: true },
  });

  if (!attachment) {
    return NextResponse.json(
      { error: "파일을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const inline = searchParams.get("inline") === "true";

  try {
    const buffer = await readFile(filePath);
    const disposition = inline
      ? "inline"
      : `attachment; filename="${encodeURIComponent(attachment.originalName)}"`;

    return new Response(buffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(buffer.length),
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    console.error("[attachments] 파일 읽기 실패:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json(
      { error: "잘못된 파일명입니다." },
      { status: 400 },
    );
  }

  try {
    const attachment = await prisma.attachment.findFirst({
      where: { filename },
      select: { id: true },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "존재하지 않는 첨부파일입니다." },
        { status: 404 },
      );
    }

    await prisma.attachment.delete({ where: { id: attachment.id } });

    // 물리 파일 삭제
    try {
      await unlink(path.join(ATTACHMENT_DIR, filename));
    } catch (err) {
      console.error("[attachments] 물리 파일 삭제 실패:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[attachments] 삭제 실패:", err);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

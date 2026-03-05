import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/shared/lib/prisma";

const ATTACHMENT_DIR = path.join(process.cwd(), "datas", "attachments");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const file = formData.get("file") as File | null;
  const guideIdStr = formData.get("guideId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "파일 크기는 10MB를 초과할 수 없습니다." },
      { status: 400 },
    );
  }

  const guideId = guideIdStr ? parseInt(guideIdStr, 10) : null;

  // 가이드당 첨부파일 개수 제한 확인
  if (guideId) {
    const count = await prisma.attachment.count({ where: { guideId } });
    if (count >= 10) {
      return NextResponse.json(
        { error: "첨부파일은 최대 10개까지 추가할 수 있습니다." },
        { status: 400 },
      );
    }
  }

  const originalName = file.name;
  const ext = path.extname(originalName) || "";
  const filename = `${crypto.randomUUID()}${ext}`;
  const mimeType = file.type || "application/octet-stream";

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await mkdir(ATTACHMENT_DIR, { recursive: true });
    await writeFile(path.join(ATTACHMENT_DIR, filename), buffer);
  } catch (err) {
    console.error("[attachments] 파일 저장 실패:", err);
    return NextResponse.json(
      { error: "파일 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  try {
    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName,
        mimeType,
        size: file.size,
        guideId,
      },
    });

    return NextResponse.json({
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: `/api/attachments/${attachment.filename}`,
    });
  } catch (err) {
    console.error("[attachments] DB 저장 실패:", err);
    return NextResponse.json(
      { error: "첨부파일 정보 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}

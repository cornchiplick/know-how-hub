import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "datas", "uploads");

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // 경로 탐색 공격 방지
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "잘못된 파일명입니다." }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_MAP[ext];

  if (!contentType) {
    return NextResponse.json(
      { error: "지원하지 않는 파일 형식입니다." },
      { status: 400 },
    );
  }

  try {
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
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
    console.error("[uploads] 파일 읽기 실패:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

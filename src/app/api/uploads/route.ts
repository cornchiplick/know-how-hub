import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "datas", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

// Magic bytes로 실제 파일 형식 검증
const MAGIC_SIGNATURES: { type: string; bytes: number[] }[] = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

function detectFileType(buffer: Buffer): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      return sig.type;
    }
  }
  return null;
}

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

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP)" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "파일 크기는 5MB를 초과할 수 없습니다." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Magic bytes 검증
  const detectedType = detectFileType(buffer);
  if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
    return NextResponse.json(
      { error: "파일 내용이 허용된 이미지 형식과 일치하지 않습니다." },
      { status: 400 },
    );
  }

  const ext = EXT_MAP[detectedType] ?? ".bin";
  const filename = `${crypto.randomUUID()}${ext}`;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  } catch (err) {
    console.error("[uploads] 파일 저장 실패:", err);
    return NextResponse.json(
      { error: "파일 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}

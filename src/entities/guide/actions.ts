"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/shared/lib/prisma";

const ATTACHMENT_DIR = path.join(process.cwd(), "datas", "attachments");

export type GuideListItem = {
  id: number;
  title: string;
};

export async function getGuidesByCategory(
  categoryId: number,
): Promise<GuideListItem[]> {
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return [];
  }

  return prisma.guide.findMany({
    where: { categoryId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true },
  });
}

export type CreateGuideInput = {
  title: string;
  content: string;
  categoryId: number;
  attachmentIds?: number[];
};

export async function createGuide(input: CreateGuideInput) {
  const { title, content, categoryId, attachmentIds } = input;

  if (!title.trim()) {
    return { success: false as const, error: "제목을 입력해주세요." };
  }

  if (!content.trim()) {
    return { success: false as const, error: "내용을 입력해주세요." };
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { success: false as const, error: "카테고리를 선택해주세요." };
  }

  try {
    const guide = await prisma.guide.create({
      data: { title: title.trim(), content, categoryId },
      select: { id: true },
    });

    // 미리 업로드된 첨부파일들을 Guide에 연결
    if (attachmentIds && attachmentIds.length > 0) {
      await prisma.attachment.updateMany({
        where: { id: { in: attachmentIds }, guideId: null },
        data: { guideId: guide.id },
      });
    }

    revalidatePath("/", "layout");
    redirect(`/guides/${guide.id}`);
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2003"
    ) {
      return {
        success: false as const,
        error: "존재하지 않는 카테고리입니다.",
      };
    }

    console.error("createGuide failed:", error);
    return {
      success: false as const,
      error: "자료 생성 중 오류가 발생했습니다.",
    };
  }
}

export type UpdateGuideInput = {
  id: number;
  title: string;
  content: string;
};

export async function updateGuide(input: UpdateGuideInput) {
  const { id, title, content } = input;

  if (!Number.isInteger(id) || id <= 0) {
    return { success: false as const, error: "유효하지 않은 자료 ID입니다." };
  }

  if (!title.trim()) {
    return { success: false as const, error: "제목을 입력해주세요." };
  }

  if (!content.trim()) {
    return { success: false as const, error: "내용을 입력해주세요." };
  }

  try {
    await prisma.guide.update({
      where: { id },
      data: { title: title.trim(), content },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return {
        success: false as const,
        error: "존재하지 않는 자료입니다.",
      };
    }

    console.error("updateGuide failed:", error);
    return {
      success: false as const,
      error: "자료 수정 중 오류가 발생했습니다.",
    };
  }

  revalidatePath("/", "layout");
  return { success: true as const };
}

export async function deleteGuide(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return { success: false as const, error: "유효하지 않은 자료 ID입니다." };
  }

  try {
    // 삭제 전 첨부파일 목록 조회
    const attachments = await prisma.attachment.findMany({
      where: { guideId: id },
      select: { filename: true },
    });

    const guide = await prisma.guide.delete({
      where: { id },
      select: { categoryId: true },
    });

    // 물리 파일 삭제 (DB cascade로 레코드는 이미 삭제됨)
    for (const att of attachments) {
      try {
        await unlink(path.join(ATTACHMENT_DIR, att.filename));
      } catch {
        // 파일이 이미 없을 수 있음
      }
    }

    revalidatePath("/", "layout");
    return { success: true as const, categoryId: guide.categoryId };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return {
        success: false as const,
        error: "존재하지 않는 자료입니다.",
      };
    }

    console.error("deleteGuide failed:", error);
    return {
      success: false as const,
      error: "자료 삭제 중 오류가 발생했습니다.",
    };
  }
}

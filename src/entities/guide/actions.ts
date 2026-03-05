"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/shared/lib/prisma";
import { findOrCreateTags } from "@/entities/tag";

const ATTACHMENT_DIR = path.join(process.cwd(), "datas", "attachments");

export type CreateGuideInput = {
  title: string;
  content: string;
  tagNames?: string[];
  attachmentIds?: number[];
};

export async function createGuide(input: CreateGuideInput) {
  const { title, content, tagNames, attachmentIds } = input;

  if (!title.trim()) {
    return { success: false as const, error: "제목을 입력해주세요." };
  }

  if (!content.trim()) {
    return { success: false as const, error: "내용을 입력해주세요." };
  }

  try {
    const tagIds = tagNames ? await findOrCreateTags(tagNames) : [];

    const guide = await prisma.guide.create({
      data: {
        title: title.trim(),
        content,
        tags:
          tagIds.length > 0
            ? { connect: tagIds.map((id) => ({ id })) }
            : undefined,
      },
      select: { id: true },
    });

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
  tagNames?: string[];
};

export async function updateGuide(input: UpdateGuideInput) {
  const { id, title, content, tagNames } = input;

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
    const tagIds = tagNames ? await findOrCreateTags(tagNames) : [];

    await prisma.guide.update({
      where: { id },
      data: {
        title: title.trim(),
        content,
        tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
      },
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
    const attachments = await prisma.attachment.findMany({
      where: { guideId: id },
      select: { filename: true },
    });

    await prisma.guide.delete({ where: { id } });

    for (const att of attachments) {
      try {
        await unlink(path.join(ATTACHMENT_DIR, att.filename));
      } catch {
        // 파일이 이미 없을 수 있음
      }
    }

    revalidatePath("/", "layout");
    return { success: true as const };
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

export async function resetAllData(): Promise<
  { success: true } | { success: false; error: string }
> {
  if (process.env.NODE_ENV === "production") {
    return { success: false, error: "운영 환경에서는 사용할 수 없습니다." };
  }

  try {
    await prisma.guide.deleteMany();
    await prisma.tag.deleteMany();
  } catch (error) {
    console.error("resetAllData failed:", error);
    return { success: false, error: "데이터 초기화 중 오류가 발생했습니다." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

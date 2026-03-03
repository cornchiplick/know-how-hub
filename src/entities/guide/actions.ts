"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/shared/lib/prisma";

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
};

export async function createGuide(input: CreateGuideInput) {
  const { title, content, categoryId } = input;

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

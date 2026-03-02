"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { categoryFormSchema } from "./schema";

export type CreateCategoryResult =
  | { success: true }
  | { success: false; error: string };

export async function createCategory(
  formData: unknown,
): Promise<CreateCategoryResult> {
  const parsed = categoryFormSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message ?? "입력값이 올바르지 않습니다.",
    };
  }

  const { name, description } = parsed.data;

  try {
    const maxOrder = await prisma.category.aggregate({
      _max: { sortOrder: true },
    });

    await prisma.category.create({
      data: {
        name,
        description: description || null,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false, error: "이미 존재하는 폴더명입니다." };
    }
    console.error("createCategory failed:", error);
    return { success: false, error: "폴더 생성 중 오류가 발생했습니다." };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

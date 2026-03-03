"use server";

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

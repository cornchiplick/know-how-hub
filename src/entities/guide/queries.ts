import { cache } from "react";
import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const getGuideById = cache(async (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return prisma.guide.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      categoryId: true,
      category: {
        select: { id: true, name: true },
      },
      createdAt: true,
      updatedAt: true,
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
});

export async function searchGuides(query: string, excludeId?: number) {
  const where: Prisma.GuideWhereInput = {};

  if (query) {
    where.title = { contains: query };
  }

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return prisma.guide.findMany({
    where,
    orderBy: { title: "asc" },
    select: { id: true, title: true },
    take: 10,
  });
}

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
      createdAt: true,
      updatedAt: true,
      tags: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
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

export async function getAllGuides() {
  return prisma.guide.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      tags: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
  });
}

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

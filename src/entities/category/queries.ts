import { prisma } from "@/shared/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}

export async function getCategoryWithGuides(id: number) {
  return prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      guides: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true },
      },
    },
  });
}

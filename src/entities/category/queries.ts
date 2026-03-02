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

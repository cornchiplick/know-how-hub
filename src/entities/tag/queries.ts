import { prisma } from "@/shared/lib/prisma";

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function searchTags(query: string) {
  return prisma.tag.findMany({
    where: query ? { name: { contains: query } } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    take: 20,
  });
}

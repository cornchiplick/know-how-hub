"use server";

import { prisma } from "@/shared/lib/prisma";

export async function findOrCreateTags(
  tagNames: string[],
): Promise<number[]> {
  const unique = [...new Set(tagNames.map((n) => n.trim().toLowerCase()).filter(Boolean))];
  if (unique.length === 0) return [];

  const ids: number[] = [];

  for (const name of unique) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    ids.push(tag.id);
  }

  return ids;
}

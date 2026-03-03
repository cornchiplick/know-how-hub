"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getGuidesByCategory, type GuideListItem } from "@/entities/guide";

interface CategoryTreeItemProps {
  id: number;
  name: string;
  description: string | null;
}

export function CategoryTreeItem({
  id,
  name,
  description,
}: CategoryTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [guides, setGuides] = useState<GuideListItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (guides !== null) return;

    setLoading(true);
    try {
      const data = await getGuidesByCategory(id);
      setGuides(data);
    } catch (error) {
      console.error("Failed to fetch guides:", error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }, [expanded, guides, id]);

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 dark:text-zinc-500 dark:hover:bg-zinc-800"
          aria-label={expanded ? "폴더 닫기" : "폴더 열기"}
          aria-expanded={expanded}
        >
          <svg
            className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <Link
          href={`/categories/${id}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          title={description ?? undefined}
        >
          <svg
            className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <span className="truncate">{name}</span>
        </Link>
      </div>

      {expanded && (
        <div className="ml-7 border-l border-zinc-200 pl-2 dark:border-zinc-700">
          {loading && (
            <div className="px-2 py-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              불러오는 중...
            </div>
          )}
          {!loading && guides !== null && guides.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              등록된 자료가 없습니다
            </div>
          )}
          {!loading &&
            guides !== null &&
            guides.length > 0 &&
            guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span className="truncate">{guide.title}</span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

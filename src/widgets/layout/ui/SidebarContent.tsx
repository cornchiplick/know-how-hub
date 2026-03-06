"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";
import { TagFilterModal } from "./TagFilterModal";

interface TagItem {
  id: number;
  name: string;
}

interface GuideItem {
  id: number;
  title: string;
  updatedAt: Date | string;
  tags: TagItem[];
}

type SortMode = "updatedAt" | "title";
type FilterMode = "or" | "and";

interface SidebarContentProps {
  guides: GuideItem[];
  tags: TagItem[];
}

export function SidebarContent({ guides, tags }: SidebarContentProps) {
  const { currentGuideId } = useSidebar();
  const [activeTagIds, setActiveTagIds] = useState<Set<number>>(
    () => new Set(tags.map((t) => t.id)),
  );
  const [sortMode, setSortMode] = useState<SortMode>("updatedAt");
  const [showTagModal, setShowTagModal] = useState(false);
  const [showUntagged, setShowUntagged] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("or");

  const toggleTag = (tagId: number) => {
    setActiveTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const allActive = activeTagIds.size === tags.length;

  const filteredAndSorted = useMemo(() => {
    let filtered = guides;

    if (!allActive || !showUntagged) {
      filtered = guides.filter((g) => {
        if (g.tags.length === 0) return showUntagged;
        if (filterMode === "and") {
          return [...activeTagIds].every((id) =>
            g.tags.some((t) => t.id === id),
          );
        }
        return g.tags.some((t) => activeTagIds.has(t.id));
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortMode === "title") {
        return a.title.localeCompare(b.title, "ko");
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, [guides, activeTagIds, allActive, showUntagged, sortMode, filterMode]);

  return (
    <aside className="flex w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href="/guides/new"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          새 자료 작성
        </Link>
      </div>

      <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            정렬
          </span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
          >
            <option value="updatedAt">수정일순</option>
            <option value="title">제목순</option>
          </select>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {allActive
                ? `${tags.length}개 태그로 필터`
                : `${activeTagIds.size}/${tags.length}개 태그로 필터 (${filterMode.toUpperCase()})`}
            </span>
            <button
              type="button"
              onClick={() => setShowTagModal(true)}
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              title="태그 필터 관리"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 overflow-auto p-3">
        <Link
          href="/"
          className="mb-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          홈
        </Link>

        {filteredAndSorted.length === 0 ? (
          <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
            {guides.length === 0
              ? "등록된 자료가 없습니다"
              : "일치하는 자료가 없습니다"}
          </p>
        ) : (
          filteredAndSorted.map((guide) => {
            const isActive = guide.id === currentGuideId;
            return (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <svg
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
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
            );
          })
        )}
      </nav>

      {showTagModal && (
        <TagFilterModal
          tags={tags}
          activeTagIds={activeTagIds}
          onToggle={toggleTag}
          onActivateAll={() => setActiveTagIds(new Set(tags.map((t) => t.id)))}
          onDeactivateAll={() => setActiveTagIds(new Set())}
          showUntagged={showUntagged}
          onToggleUntagged={() => setShowUntagged((prev) => !prev)}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          onClose={() => setShowTagModal(false)}
        />
      )}
    </aside>
  );
}

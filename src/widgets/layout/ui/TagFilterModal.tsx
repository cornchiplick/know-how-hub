"use client";

import { useEffect, useMemo } from "react";

interface TagItem {
  id: number;
  name: string;
}

type FilterMode = "or" | "and";

interface TagFilterModalProps {
  tags: TagItem[];
  activeTagIds: Set<number>;
  onToggle: (tagId: number) => void;
  onActivateAll: () => void;
  onDeactivateAll: () => void;
  showUntagged: boolean;
  onToggleUntagged: () => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  onClose: () => void;
}

export function TagFilterModal({
  tags,
  activeTagIds,
  onToggle,
  onActivateAll,
  onDeactivateAll,
  showUntagged,
  onToggleUntagged,
  filterMode,
  onFilterModeChange,
  onClose,
}: TagFilterModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const { activeTags, inactiveTags } = useMemo(() => {
    const active: TagItem[] = [];
    const inactive: TagItem[] = [];

    const sorted = [...tags].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    for (const tag of sorted) {
      if (activeTagIds.has(tag.id)) {
        active.push(tag);
      } else {
        inactive.push(tag);
      }
    }

    return { activeTags: active, inactiveTags: inactive };
  }, [tags, activeTagIds]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-3xl rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-8 py-6 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            태그 필터 관리
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex rounded-md border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => onFilterModeChange("or")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  filterMode === "or"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                } rounded-l-md`}
              >
                OR
              </button>
              <button
                type="button"
                onClick={() => onFilterModeChange("and")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  filterMode === "and"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                } rounded-r-md`}
              >
                AND
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                태그 없음
              </span>
              <button
                type="button"
                onClick={onToggleUntagged}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  showUntagged ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    showUntagged ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] min-h-[40vh] overflow-auto px-8 py-8">
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold tracking-wider text-green-600 uppercase dark:text-green-400">
                활성화된 태그 ({activeTags.length})
              </span>
              {activeTags.length > 0 && (
                <button
                  type="button"
                  onClick={onDeactivateAll}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  전체 해제
                </button>
              )}
            </div>
            {activeTags.length === 0 ? (
              <p className="text-base text-zinc-400 dark:text-zinc-500">
                활성화된 태그가 없습니다
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {activeTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggle(tag.id)}
                    className="rounded-full bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                비활성화된 태그 ({inactiveTags.length})
              </span>
              {inactiveTags.length > 0 && (
                <button
                  type="button"
                  onClick={onActivateAll}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  전체 활성화
                </button>
              )}
            </div>
            {inactiveTags.length === 0 ? (
              <p className="text-base text-zinc-400 dark:text-zinc-500">
                비활성화된 태그가 없습니다
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {inactiveTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggle(tag.id)}
                    className="rounded-full bg-zinc-200 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

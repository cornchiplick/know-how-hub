"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GuideViewer } from "./GuideViewer";
import { GuideEditor } from "./GuideEditor";
import { CategoryBadge } from "./CategoryBadge";
import { updateGuide } from "@/entities/guide";

interface GuideData {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  category: { id: number; name: string };
  createdAt: Date;
  updatedAt: Date;
}

interface GuideDetailViewProps {
  guide: GuideData;
}

export function GuideDetailView({ guide }: GuideDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(guide.title);
  const [editContent, setEditContent] = useState(guide.content);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = () => {
    setEditTitle(guide.title);
    setEditContent(guide.content);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = () => {
    setError(null);

    startTransition(async () => {
      const result = await updateGuide({
        id: guide.id,
        title: editTitle,
        content: editContent,
      });

      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const formattedDate = new Date(guide.updatedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-6">
          <CategoryBadge name={guide.category.name} />
        </div>

        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="mb-4 w-full border-none bg-transparent text-2xl font-bold text-zinc-900 placeholder-zinc-300 outline-none dark:text-zinc-100 dark:placeholder-zinc-600"
        />

        <GuideEditor
          content={editContent}
          onChange={setEditContent}
          excludeGuideId={guide.id}
        />

        {error && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <CategoryBadge name={guide.category.name} />
        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          편집
        </button>
      </div>

      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {guide.title}
      </h1>

      <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
        최종 수정: {formattedDate}
      </p>

      <hr className="mb-6 border-zinc-200 dark:border-zinc-700" />

      <GuideViewer content={guide.content} />
    </div>
  );
}

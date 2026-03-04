"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GuideViewer } from "./GuideViewer";
import { GuideEditor } from "./GuideEditor";
import { CategoryBadge } from "./CategoryBadge";
import { updateGuide, deleteGuide } from "@/entities/guide";
import { Modal } from "@/shared/ui";

interface GuideData {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

interface GuideDetailViewProps {
  guide: GuideData;
}

async function fetchGuide(id: number): Promise<GuideData> {
  const res = await fetch(`/api/guides/${id}`);
  if (!res.ok) throw new Error("자료를 불러오지 못했습니다.");
  return res.json();
}

export function GuideDetailView({ guide: initialGuide }: GuideDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["guide", initialGuide.id];
  const [initialDataUpdatedAt] = useState(() => Date.now());

  const { data: guide = initialGuide } = useQuery({
    queryKey,
    queryFn: () => fetchGuide(initialGuide.id),
    initialData: initialGuide,
    initialDataUpdatedAt,
    staleTime: 5 * 60 * 1000,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

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
        queryClient.setQueryData(queryKey, (old: GuideData | undefined) =>
          old ? { ...old, title: editTitle, content: editContent } : old,
        );
        setIsEditing(false);
        toast.success("저장되었습니다.");
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ["guides", guide.categoryId] });
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setDeleteError(null);

    startDeleteTransition(async () => {
      const result = await deleteGuide(guide.id);

      if (result.success) {
        setIsDeleteModalOpen(false);
        router.push(`/categories/${result.categoryId}`);
      } else {
        setDeleteError(result.error);
      }
    });
  };

  const formattedDate = new Date(guide.updatedAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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
        <div className="flex items-center gap-1">
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
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            삭제
          </button>
        </div>
      </div>

      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {guide.title}
      </h1>

      <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
        최종 수정: {formattedDate}
      </p>

      <hr className="mb-6 border-zinc-200 dark:border-zinc-700" />

      <GuideViewer content={guide.content} />

      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteError(null);
          }
        }}
        title="자료 삭제"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          &lsquo;{guide.title}&rsquo; 자료를 삭제하시겠습니까?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </p>

        {deleteError && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">
            {deleteError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setDeleteError(null);
            }}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

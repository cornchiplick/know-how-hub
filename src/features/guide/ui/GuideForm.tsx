"use client";

import { useState, useTransition } from "react";
import { GuideEditor } from "./GuideEditor";
import { CategoryBadge } from "./CategoryBadge";
import {
  AttachmentUploader,
  type AttachmentItem,
} from "./AttachmentUploader";
import { createGuide } from "@/entities/guide";

interface GuideFormProps {
  categoryId: number;
  categoryName: string;
}

export function GuideForm({ categoryId, categoryName }: GuideFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);

    startTransition(async () => {
      const result = await createGuide({
        title,
        content,
        categoryId,
        attachmentIds: attachments.map((a) => a.id),
      });
      if (result && !result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-6">
        <CategoryBadge name={categoryName} />
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="mb-4 w-full border-none bg-transparent text-2xl font-bold text-zinc-900 placeholder-zinc-300 outline-none dark:text-zinc-100 dark:placeholder-zinc-600"
      />

      <AttachmentUploader
        attachments={attachments}
        onChange={setAttachments}
      />

      <GuideEditor content={content} onChange={setContent} />

      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
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

"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { GuideEditor, type GuideEditorHandle } from "./GuideEditor";
import { TagInput } from "./TagInput";
import {
  AttachmentUploader,
  type AttachmentItem,
} from "./AttachmentUploader";
import { MarkdownImportButton } from "./MarkdownImportButton";
import { createGuide } from "@/entities/guide";

export function GuideForm() {
  const editorRef = useRef<GuideEditorHandle>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleMarkdownImport = useCallback(
    (data: { title: string; html: string }) => {
      if (data.title) setTitle(data.title);
      editorRef.current?.setHtmlContent(data.html);
    },
    [],
  );

  const handleSave = () => {
    setError(null);

    startTransition(async () => {
      const result = await createGuide({
        title,
        content,
        tagNames: tags,
        attachmentIds: attachments.map((a) => a.id),
      });
      if (result && !result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="min-w-0 flex-1 border-none bg-transparent text-2xl font-bold text-zinc-900 placeholder-zinc-300 outline-none dark:text-zinc-100 dark:placeholder-zinc-600"
        />
        <MarkdownImportButton onImport={handleMarkdownImport} />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          태그
        </label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <AttachmentUploader
        attachments={attachments}
        onChange={setAttachments}
      />

      <GuideEditor ref={editorRef} content={content} onChange={setContent} />

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

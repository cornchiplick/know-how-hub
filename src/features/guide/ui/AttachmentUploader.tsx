"use client";

import { useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface AttachmentItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface AttachmentUploaderProps {
  guideId?: number;
  attachments: AttachmentItem[];
  onChange: (attachments: AttachmentItem[]) => void;
  maxCount?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentUploader({
  guideId,
  attachments,
  onChange,
  maxCount = 10,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" 파일 크기가 10MB를 초과합니다.`);
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      if (guideId) {
        formData.append("guideId", String(guideId));
      }

      try {
        const res = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "업로드에 실패했습니다.");
          return null;
        }

        return {
          id: data.id,
          filename: data.filename,
          originalName: data.originalName,
          mimeType: data.mimeType,
          size: data.size,
        } as AttachmentItem;
      } catch {
        toast.error(`"${file.name}" 업로드 중 오류가 발생했습니다.`);
        return null;
      }
    },
    [guideId],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxCount - attachments.length;

      if (remaining <= 0) {
        toast.error(`첨부파일은 최대 ${maxCount}개까지 추가할 수 있습니다.`);
        return;
      }

      const filesToUpload = fileArray.slice(0, remaining);
      if (fileArray.length > remaining) {
        toast.error(
          `최대 ${maxCount}개까지 첨부 가능합니다. ${remaining}개만 업로드합니다.`,
        );
      }

      setUploadingCount(filesToUpload.length);

      const results = await Promise.all(filesToUpload.map(uploadFile));
      const successful = results.filter(
        (r): r is AttachmentItem => r !== null,
      );

      if (successful.length > 0) {
        onChange([...attachments, ...successful]);
      }

      setUploadingCount(0);
    },
    [attachments, maxCount, onChange, uploadFile],
  );

  const handleDelete = useCallback(
    async (attachment: AttachmentItem) => {
      try {
        const res = await fetch(`/api/attachments/${attachment.filename}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "삭제에 실패했습니다.");
          return;
        }

        onChange(attachments.filter((a) => a.id !== attachment.id));
      } catch {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    },
    [attachments, onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          첨부파일
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          ({attachments.length}/{maxCount})
        </span>
      </div>

      {/* 파일 목록 */}
      {attachments.length > 0 && (
        <div className="mb-2 space-y-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
            >
              <svg
                className="h-4 w-4 flex-shrink-0 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                {att.originalName}
              </span>
              <span className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {formatFileSize(att.size)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(att)}
                className="flex-shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                title="삭제"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {attachments.length < maxCount && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-4 py-3 transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
              : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadingCount > 0 ? (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              업로드 중... ({uploadingCount}개)
            </span>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>파일 추가 또는 드래그</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

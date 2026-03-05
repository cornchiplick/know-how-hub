"use client";

import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";

interface AttachmentItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  if (attachments.length === 0) return null;

  const handleClick = (att: AttachmentItem) => {
    if (isImageMimeType(att.mimeType)) {
      setLightboxImage({
        src: `/api/attachments/${att.filename}?inline=true`,
        alt: att.originalName,
      });
    } else {
      // 비이미지 파일: 다운로드
      window.open(`/api/attachments/${att.filename}`, "_blank");
    }
  };

  const handleDownload = (att: AttachmentItem) => {
    const link = document.createElement("a");
    link.href = `/api/attachments/${att.filename}`;
    link.download = att.originalName;
    link.click();
  };

  return (
    <>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-zinc-400"
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
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            첨부파일 ({attachments.length})
          </span>
        </div>
        <div className="space-y-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
            >
              {isImageMimeType(att.mimeType) ? (
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>
              ) : (
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              )}
              <button
                type="button"
                onClick={() => handleClick(att)}
                className="min-w-0 flex-1 truncate text-left text-sm text-blue-600 hover:underline dark:text-blue-400"
                title={
                  isImageMimeType(att.mimeType)
                    ? "클릭하여 미리보기"
                    : "클릭하여 다운로드"
                }
              >
                {att.originalName}
              </button>
              <span className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {formatFileSize(att.size)}
              </span>
              <button
                type="button"
                onClick={() => handleDownload(att)}
                className="flex-shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                title="다운로드"
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
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}

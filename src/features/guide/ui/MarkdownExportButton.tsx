"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { tiptapJsonToMarkdown } from "../lib/toMarkdown";

interface MarkdownExportButtonProps {
  guide: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    tags?: { id: number; name: string }[];
    attachments?: {
      id: number;
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
    }[];
  };
}

function sanitizeFilename(title: string): string {
  return title.replace(/[<>:"/\\|?*]/g, "").trim() || "guide";
}

function formatDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function buildMarkdown(guide: MarkdownExportButtonProps["guide"]): string {
  const lines: string[] = [];

  // YAML frontmatter
  lines.push("---");
  lines.push(`title: ${guide.title}`);
  if (guide.tags && guide.tags.length > 0) {
    const tagList = guide.tags.map((t) => t.name).join(", ");
    lines.push(`tags: [${tagList}]`);
  }
  lines.push(`createdAt: ${formatDate(guide.createdAt)}`);
  lines.push(`updatedAt: ${formatDate(guide.updatedAt)}`);
  lines.push("---");
  lines.push("");

  // Title heading
  lines.push(`# ${guide.title}`);
  lines.push("");

  // Body content
  const body = tiptapJsonToMarkdown(guide.content);
  lines.push(body);

  // Attachments section
  if (guide.attachments && guide.attachments.length > 0) {
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 첨부파일");
    for (const attachment of guide.attachments) {
      lines.push(
        `- [${attachment.originalName}](/api/attachments/${attachment.filename})`,
      );
    }
  }

  return lines.join("\n");
}

export function MarkdownExportButton({ guide }: MarkdownExportButtonProps) {
  const handleExport = useCallback(() => {
    const markdown = buildMarkdown(guide);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(guide.title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("마크다운 파일이 다운로드되었습니다.");
  }, [guide]);

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      내보내기
    </button>
  );
}

"use client";

import { useRef, useCallback } from "react";
import { marked } from "marked";
import toast from "react-hot-toast";

interface MarkdownImportButtonProps {
  onImport: (data: { title: string; html: string }) => void;
}

function extractTitle(markdown: string): { title: string; body: string } {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) {
    const title = match[1].trim();
    const body = markdown.replace(match[0], "").trimStart();
    return { title, body };
  }
  return { title: "", body: markdown };
}

export function MarkdownImportButton({ onImport }: MarkdownImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
        toast.error("마크다운 파일(.md)만 업로드할 수 있습니다.");
        e.target.value = "";
        return;
      }

      try {
        const text = await file.text();
        const { title, body } = extractTitle(text);
        const html = await marked.parse(body);

        onImport({
          title: title || file.name.replace(/\.(md|markdown)$/, ""),
          html,
        });

        toast.success("마크다운 파일을 불러왔습니다.");
      } catch {
        toast.error("파일을 읽는 중 오류가 발생했습니다.");
      }

      e.target.value = "";
    },
    [onImport],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
      >
        .md 파일 불러오기
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}

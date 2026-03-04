"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { mentionViewerRenderHTML } from "../lib/mentionConfig";
import { parseContent } from "../lib/parseContent";

interface GuideViewerProps {
  content: string;
}

export function GuideViewer({ content }: GuideViewerProps) {
  const router = useRouter();
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        renderHTML: mentionViewerRenderHTML,
      }),
    ],
    content: parseContent(content),
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // 코드블럭 클릭 → 클립보드 복사
      const preEl = target.closest<HTMLElement>("pre");
      if (preEl) {
        const code = preEl.querySelector("code");
        const text = code?.textContent ?? preEl.textContent ?? "";
        navigator.clipboard.writeText(text).then(
          () => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          },
          () => {
            // clipboard API 사용 불가 시 무시
          },
        );
        return;
      }

      // mention 클릭 → Ctrl/Cmd+Click으로 이동
      const mentionEl = target.closest<HTMLElement>(".mention-link");
      if (mentionEl) {
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey || e.metaKey) {
          const guideId = mentionEl.dataset.guideId;
          if (guideId) {
            router.push(`/guides/${guideId}`);
          }
        }
      }
    },
    [router],
  );

  // Ctrl/Cmd 키 상태 감지
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        setCtrlPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        setCtrlPressed(false);
      }
    };
    const handleBlur = () => setCtrlPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-sm text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div
      className={`guide-viewer ${ctrlPressed ? "ctrl-active" : ""}`}
      onClickCapture={handleClick}
    >
      <EditorContent
        editor={editor}
        className="prose prose-zinc dark:prose-invert max-w-none"
      />
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg dark:bg-zinc-200 dark:text-zinc-900">
          복사되었습니다
        </div>
      )}
    </div>
  );
}

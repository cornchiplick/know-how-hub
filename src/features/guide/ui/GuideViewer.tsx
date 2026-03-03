"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";
import { mentionRenderHTML } from "../lib/mentionConfig";
import { parseContent } from "../lib/parseContent";

interface GuideViewerProps {
  content: string;
}

export function GuideViewer({ content }: GuideViewerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        renderHTML: mentionRenderHTML,
      }),
    ],
    content: parseContent(content),
  });

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mentionLink = target.closest<HTMLAnchorElement>(".mention-link");

      if (mentionLink) {
        e.preventDefault();
        const guideId = mentionLink.dataset.guideId;
        if (guideId) {
          router.push(`/guides/${guideId}`);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("click", handleClick as EventListener);
    return () => {
      el.removeEventListener("click", handleClick as EventListener);
    };
  }, [handleClick]);

  if (!editor) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-sm text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="guide-viewer" ref={containerRef}>
      <EditorContent
        editor={editor}
        className="prose prose-zinc dark:prose-invert max-w-none"
      />
    </div>
  );
}

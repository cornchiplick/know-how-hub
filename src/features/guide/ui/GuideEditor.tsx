"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { createMentionSuggestion } from "./mentionSuggestion";
import { mentionRenderHTML } from "../lib/mentionConfig";
import { parseContent } from "../lib/parseContent";
import type { Editor } from "@tiptap/react";

interface GuideEditorProps {
  content?: string;
  onChange?: (json: string) => void;
  excludeGuideId?: number;
  editable?: boolean;
}

export function GuideEditor({
  content,
  onChange,
  excludeGuideId,
  editable = true,
}: GuideEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "내용을 입력하세요... (@로 다른 자료를 참조할 수 있습니다)",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: createMentionSuggestion(excludeGuideId),
        renderHTML: mentionRenderHTML,
      }),
    ],
    content: parseContent(content),
    onUpdate: ({ editor: e }: { editor: Editor }) => {
      onChange?.(JSON.stringify(e.getJSON()));
    },
  });

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="text-sm text-zinc-400">에디터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="guide-editor">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className={`prose prose-zinc dark:prose-invert max-w-none rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700 ${
          editable
            ? "min-h-64 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            : ""
        }`}
      />
    </div>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800/50">
      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        label="H1"
      />
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="H2"
      />
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="H3"
      />
      <ToolbarDivider />
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="B"
        className="font-bold"
      />
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="I"
        className="italic"
      />
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="S"
        className="line-through"
      />
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        label="<>"
      />
      <ToolbarDivider />
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="•"
      />
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="1."
      />
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="❝"
      />
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        label="{ }"
      />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs transition-colors ${className} ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div className="mx-1 h-6 w-px self-center bg-zinc-300 dark:bg-zinc-600" />
  );
}


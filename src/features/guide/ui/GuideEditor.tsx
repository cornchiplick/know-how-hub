"use client";

import { useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Selection } from "@tiptap/pm/state";
import toast from "react-hot-toast";
import { createMentionSuggestion } from "./mentionSuggestion";
import { mentionRenderHTML } from "../lib/mentionConfig";
import { parseContent } from "../lib/parseContent";
import type { Editor } from "@tiptap/react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP)",
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("파일 크기는 5MB를 초과할 수 없습니다.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/uploads", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
  }

  return data.url as string;
}

function insertImage(editor: Editor, url: string) {
  editor.chain().focus().setImage({ src: url }).run();
}

async function handleFiles(editor: Editor, files: File[]) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    try {
      const url = await uploadImage(file);
      insertImage(editor, url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "이미지 업로드 실패");
    }
  }
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

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
      Image.configure({
        inline: false,
        allowBase64: false,
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
    onCreate: ({ editor: e }) => {
      editorRef.current = e;
    },
    onUpdate: ({ editor: e }: { editor: Editor }) => {
      onChange?.(JSON.stringify(e.getJSON()));
    },
    editorProps: {
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;

        const imageFiles = Array.from(files).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (!imageFiles.length) return false;

        event.preventDefault();

        // 드롭 위치에 커서 이동
        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (pos) {
          view.dispatch(
            view.state.tr.setSelection(
              Selection.near(view.state.doc.resolve(pos.pos)),
            ),
          );
        }

        if (editorRef.current) {
          handleFiles(editorRef.current, imageFiles);
        }
        return true;
      },
      handlePaste(_view, event) {
        const files = event.clipboardData?.files;
        if (!files?.length) return false;

        const imageFiles = Array.from(files).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (!imageFiles.length) return false;

        event.preventDefault();
        if (editorRef.current) {
          handleFiles(editorRef.current, imageFiles);
        }
        return true;
      },
    },
  });

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor || !e.target.files?.length) return;
      handleFiles(editor, Array.from(e.target.files));
      e.target.value = "";
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="text-sm text-zinc-400">에디터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="guide-editor">
      {editable && (
        <>
          <EditorToolbar
            editor={editor}
            onImageClick={handleImageButtonClick}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
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

function EditorToolbar({
  editor,
  onImageClick,
}: {
  editor: Editor;
  onImageClick: () => void;
}) {
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
      <ToolbarDivider />
      <ToolbarButton active={false} onClick={onImageClick} label="🖼" />
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

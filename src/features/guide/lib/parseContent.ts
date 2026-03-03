import type { Content } from "@tiptap/react";

export function parseContent(content?: string): Content {
  if (!content) return "";

  try {
    return JSON.parse(content) as Content;
  } catch {
    return content;
  }
}

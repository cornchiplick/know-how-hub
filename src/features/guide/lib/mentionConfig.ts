import type { MentionOptions } from "@tiptap/extension-mention";

/** 에디터용: @자료명 형태로 표시 */
export const mentionRenderHTML: MentionOptions["renderHTML"] = ({
  options,
  node,
}) => {
  return [
    "span",
    {
      ...options.HTMLAttributes,
      "data-guide-id": node.attrs.id,
      "data-mention": "true",
      class: `${options.HTMLAttributes.class} mention-link`,
    },
    `@${node.attrs.label ?? node.attrs.id}`,
  ];
};

/** 뷰어용: 자료명만 표시 (@ 없음) */
export const mentionViewerRenderHTML: MentionOptions["renderHTML"] = ({
  options,
  node,
}) => {
  return [
    "span",
    {
      ...options.HTMLAttributes,
      "data-guide-id": node.attrs.id,
      "data-mention": "true",
      class: `${options.HTMLAttributes.class} mention-link`,
    },
    `${node.attrs.label ?? node.attrs.id}`,
  ];
};

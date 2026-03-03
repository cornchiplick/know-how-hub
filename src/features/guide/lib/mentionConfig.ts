import type { MentionOptions } from "@tiptap/extension-mention";

export const mentionRenderHTML: MentionOptions["renderHTML"] = ({
  options,
  node,
}) => {
  return [
    "a",
    {
      ...options.HTMLAttributes,
      "data-guide-id": node.attrs.id,
      href: `/guides/${node.attrs.id}`,
      class: `${options.HTMLAttributes.class} mention-link`,
    },
    `@${node.attrs.label ?? node.attrs.id}`,
  ];
};

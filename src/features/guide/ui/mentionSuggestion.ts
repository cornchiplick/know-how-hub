import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import {
  MentionList,
  type MentionListRef,
  type MentionItem,
} from "./MentionList";

export function createMentionSuggestion(
  excludeGuideId?: number,
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingResolve: ((items: MentionItem[]) => void) | null = null;

  return {
    items: async ({ query }) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (pendingResolve) {
        pendingResolve([]);
        pendingResolve = null;
      }

      return new Promise<MentionItem[]>((resolve) => {
        pendingResolve = resolve;
        debounceTimer = setTimeout(async () => {
          pendingResolve = null;
          try {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (excludeGuideId)
              params.set("excludeId", String(excludeGuideId));

            const res = await fetch(
              `/api/guides/search?${params.toString()}`,
            );
            const data = await res.json();
            resolve(data);
          } catch {
            resolve([]);
          }
        }, 300);
      });
    },

    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: HTMLDivElement | null = null;

      return {
        onStart: (props: SuggestionProps<MentionItem>) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          popup = document.createElement("div");
          popup.style.position = "absolute";
          popup.style.zIndex = "50";
          popup.appendChild(component.element);
          document.body.appendChild(popup);

          updatePosition(popup, props.clientRect ?? null);
        },

        onUpdate: (props: SuggestionProps<MentionItem>) => {
          component?.updateProps(props);
          updatePosition(popup, props.clientRect ?? null);
        },

        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            if (popup) popup.style.display = "none";
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit: () => {
          if (popup) {
            popup.remove();
            popup = null;
          }
          component?.destroy();
        },
      };
    },
  };
}

function updatePosition(
  popup: HTMLDivElement | null,
  clientRect: (() => DOMRect | null) | null,
) {
  if (!popup || !clientRect) return;

  const rect = clientRect();
  if (!rect) return;

  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
}

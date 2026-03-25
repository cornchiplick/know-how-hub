import { marked, type Token, type Tokens } from "marked";

type TiptapMark = {
  type: string;
  attrs?: Record<string, string>;
};

type TiptapNode = {
  type: string;
  attrs?: Record<string, string | number | boolean | null>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

/**
 * 마크다운 문자열을 Tiptap JSON 문서로 변환합니다.
 * marked로 토큰을 파싱한 뒤 Tiptap JSON 노드로 매핑합니다.
 */
export function markdownToTiptapJson(markdown: string): string {
  const tokens = marked.lexer(markdown);
  const content = tokensToNodes(tokens);
  return JSON.stringify({ type: "doc", content });
}

function tokensToNodes(tokens: Token[]): TiptapNode[] {
  const nodes: TiptapNode[] = [];

  for (const token of tokens) {
    const node = tokenToNode(token);
    if (node) {
      if (Array.isArray(node)) {
        nodes.push(...node);
      } else {
        nodes.push(node);
      }
    }
  }

  return nodes;
}

function tokenToNode(token: Token): TiptapNode | TiptapNode[] | null {
  switch (token.type) {
    case "heading":
      return {
        type: "heading",
        attrs: { level: token.depth },
        content: inlineTokensToNodes(token.tokens ?? []),
      };

    case "paragraph":
      return {
        type: "paragraph",
        content: inlineTokensToNodes(token.tokens ?? []),
      };

    case "blockquote":
      return {
        type: "blockquote",
        content: tokensToNodes(token.tokens ?? []),
      };

    case "code":
      return {
        type: "codeBlock",
        attrs: { language: token.lang || null },
        content: [{ type: "text", text: token.text }],
      };

    case "list":
      return {
        type: token.ordered ? "orderedList" : "bulletList",
        attrs: token.ordered ? { start: token.start } : undefined,
        content: (token.items ?? []).map(listItemToNode),
      };

    case "hr":
      return { type: "horizontalRule" };

    case "image":
      return {
        type: "image",
        attrs: { src: token.href, alt: token.text || null },
      };

    case "space":
      return null;

    case "html":
      // HTML 블록은 paragraph로 감싸서 텍스트로 보존
      return {
        type: "paragraph",
        content: [{ type: "text", text: token.text }],
      };

    default:
      return null;
  }
}

function listItemToNode(item: Tokens.ListItem): TiptapNode {
  const children: TiptapNode[] = [];

  for (const token of item.tokens ?? []) {
    if (token.type === "text" && "tokens" in token && token.tokens) {
      // 리스트 아이템 내의 인라인 텍스트 → paragraph로 감싸기
      children.push({
        type: "paragraph",
        content: inlineTokensToNodes(token.tokens),
      });
    } else if (token.type === "list") {
      const listNode = tokenToNode(token);
      if (listNode && !Array.isArray(listNode)) {
        children.push(listNode);
      }
    } else {
      const node = tokenToNode(token);
      if (node) {
        if (Array.isArray(node)) {
          children.push(...node);
        } else {
          children.push(node);
        }
      }
    }
  }

  return { type: "listItem", content: children };
}

function inlineTokensToNodes(tokens: Token[]): TiptapNode[] {
  const nodes: TiptapNode[] = [];

  for (const token of tokens) {
    const inlineNodes = inlineTokenToNodes(token);
    nodes.push(...inlineNodes);
  }

  return nodes;
}

function inlineTokenToNodes(token: Token): TiptapNode[] {
  switch (token.type) {
    case "text": {
      if ("tokens" in token && token.tokens && token.tokens.length > 0) {
        return inlineTokensToNodes(token.tokens);
      }
      return [{ type: "text", text: token.text }];
    }

    case "strong": {
      const children = inlineTokensToNodes(token.tokens ?? []);
      return children.map((child) => addMark(child, { type: "bold" }));
    }

    case "em": {
      const children = inlineTokensToNodes(token.tokens ?? []);
      return children.map((child) => addMark(child, { type: "italic" }));
    }

    case "del": {
      const children = inlineTokensToNodes(token.tokens ?? []);
      return children.map((child) => addMark(child, { type: "strike" }));
    }

    case "codespan":
      return [
        {
          type: "text",
          text: token.text,
          marks: [{ type: "code" }],
        },
      ];

    case "link": {
      const children = inlineTokensToNodes(token.tokens ?? []);
      return children.map((child) =>
        addMark(child, { type: "link", attrs: { href: token.href } }),
      );
    }

    case "image":
      return [
        {
          type: "image",
          attrs: { src: token.href, alt: token.text || null },
        },
      ];

    case "br":
      return [{ type: "hardBreak" }];

    case "escape":
      return [{ type: "text", text: token.text }];

    default:
      return [];
  }
}

function addMark(node: TiptapNode, mark: TiptapMark): TiptapNode {
  return {
    ...node,
    marks: [...(node.marks ?? []), mark],
  };
}

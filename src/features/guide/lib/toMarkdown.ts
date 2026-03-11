type Mark = {
  type: string;
  attrs?: Record<string, string>;
};

type TiptapNode = {
  type: string;
  attrs?: Record<string, string | number>;
  content?: TiptapNode[];
  marks?: Mark[];
  text?: string;
};

type TiptapDoc = {
  type: "doc";
  content: TiptapNode[];
};

function applyMarks(text: string, marks: Mark[]): string {
  return marks.reduce((result, mark) => {
    switch (mark.type) {
      case "bold":
        return `**${result}**`;
      case "italic":
        return `*${result}*`;
      case "strike":
        return `~~${result}~~`;
      case "code":
        return `\`${result}\``;
      case "link":
        return `[${result}](${mark.attrs?.href ?? ""})`;
      default:
        return result;
    }
  }, text);
}

function renderInline(nodes: TiptapNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        const text = node.text ?? "";
        return node.marks ? applyMarks(text, node.marks) : text;
      }
      if (node.type === "mention") {
        const id = node.attrs?.id ?? "";
        const label = node.attrs?.label ?? "";
        return `[@${label}](/guides/${id})`;
      }
      return "";
    })
    .join("");
}

function renderNode(node: TiptapNode, listDepth = 0): string {
  switch (node.type) {
    case "heading": {
      const level = Number(node.attrs?.level ?? 1);
      const prefix = "#".repeat(Math.min(level, 3));
      const text = renderInline(node.content ?? []);
      return `${prefix} ${text}\n\n`;
    }
    case "paragraph": {
      const text = renderInline(node.content ?? []);
      return `${text}\n\n`;
    }
    case "bulletList": {
      return (node.content ?? []).map((item) => renderListItem(item, "-", listDepth)).join("");
    }
    case "orderedList": {
      return (node.content ?? []).map((item, i) => renderListItem(item, `${i + 1}.`, listDepth)).join("");
    }
    case "blockquote": {
      const inner = (node.content ?? []).map((n) => renderNode(n, listDepth)).join("");
      return inner
        .split("\n")
        .map((line) => (line.trim() ? `> ${line}` : ">"))
        .join("\n")
        .trimEnd() + "\n\n";
    }
    case "codeBlock": {
      const lang = (node.attrs?.language as string) ?? "";
      const code = (node.content ?? []).map((n) => n.text ?? "").join("");
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }
    case "image": {
      const alt = (node.attrs?.alt as string) ?? "";
      const src = (node.attrs?.src as string) ?? "";
      return `![${alt}](${src})\n\n`;
    }
    case "horizontalRule":
      return `---\n\n`;
    default:
      return "";
  }
}

function renderListItem(item: TiptapNode, bullet: string, depth: number): string {
  const indent = "  ".repeat(depth);
  const children = item.content ?? [];
  const lines: string[] = [];

  for (const child of children) {
    if (child.type === "paragraph") {
      lines.push(`${indent}${bullet} ${renderInline(child.content ?? [])}\n`);
    } else if (child.type === "bulletList") {
      lines.push(
        (child.content ?? []).map((nested) => renderListItem(nested, "-", depth + 1)).join("")
      );
    } else if (child.type === "orderedList") {
      lines.push(
        (child.content ?? []).map((nested, i) => renderListItem(nested, `${i + 1}.`, depth + 1)).join("")
      );
    }
  }

  return lines.join("");
}

export function tiptapJsonToMarkdown(jsonString: string): string {
  try {
    const doc = JSON.parse(jsonString) as TiptapDoc;
    if (!doc.content) return "";
    return doc.content
      .map((node) => renderNode(node))
      .join("")
      .trimEnd();
  } catch {
    return "";
  }
}

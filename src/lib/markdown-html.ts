/**
 * تحويل بين ماركداون (صيغة تخزين محتوى الكتب التي يقرأها القارئ)
 * وHTML الذي يتعامل معه محرّر المخطوطة.
 */

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineToHtml(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function markdownToHtml(markdown: string): string {
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;

  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      const level = heading[1]!.length;
      out.push(`<h${level}>${inlineToHtml(heading[2]!)}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (list !== "ul") {
        closeList();
        list = "ul";
        out.push("<ul>");
      }
      out.push(`<li>${inlineToHtml(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (list !== "ol") {
        closeList();
        list = "ol";
        out.push("<ol>");
      }
      out.push(`<li>${inlineToHtml(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }
    if (line === "---") {
      closeList();
      out.push("<hr />");
      continue;
    }
    if (line.startsWith("> ")) {
      closeList();
      out.push(`<blockquote><p>${inlineToHtml(line.slice(2))}</p></blockquote>`);
      continue;
    }
    closeList();
    out.push(`<p>${inlineToHtml(line)}</p>`);
  }
  closeList();
  return out.join("");
}

export function htmlToMarkdown(html: string): string {
  if (typeof document === "undefined") return html;
  const root = document.createElement("div");
  root.innerHTML = html;

  const inline = (node: Element): string => {
    let text = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent ?? "";
        return;
      }
      const el = child as Element;
      const inner = inline(el);
      const tag = el.tagName.toLowerCase();
      if (tag === "strong" || tag === "b") text += `**${inner}**`;
      else if (tag === "em" || tag === "i") text += `*${inner}*`;
      else if (tag === "br") text += " ";
      else text += inner;
    });
    return text.replace(/\s+/g, " ").trim();
  };

  const blocks: string[] = [];
  root.childNodes.forEach((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    const tag = el.tagName.toLowerCase();
    const heading = /^h([1-6])$/.exec(tag);
    if (heading) {
      blocks.push(`${"#".repeat(Number(heading[1]))} ${inline(el)}`);
    } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(el.children).map((li, index) =>
        tag === "ul" ? `- ${inline(li)}` : `${index + 1}. ${inline(li)}`,
      );
      blocks.push(items.join("\n"));
    } else if (tag === "blockquote") {
      blocks.push(
        Array.from(el.children)
          .map((p) => `> ${inline(p)}`)
          .join("\n"),
      );
    } else if (tag === "hr") {
      blocks.push("---");
    } else {
      const text = inline(el);
      if (text) blocks.push(text);
    }
  });

  return blocks.join("\n\n");
}

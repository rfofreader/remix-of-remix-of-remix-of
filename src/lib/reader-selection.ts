import type { Highlight } from "./reader-storage";

export interface Segment {
  text: string;
  highlight?: Highlight;
}

/** Split a paragraph's text into plain/highlighted segments. */
export function segmentParagraph(text: string, highlights: Highlight[]): Segment[] {
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let cursor = 0;

  for (const hl of sorted) {
    const start = Math.max(0, Math.min(hl.start, text.length));
    const end = Math.max(start, Math.min(hl.end, text.length));
    if (end <= cursor) continue;
    if (start > cursor) segments.push({ text: text.slice(cursor, start) });
    segments.push({ text: text.slice(Math.max(start, cursor), end), highlight: hl });
    cursor = end;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length ? segments : [{ text }];
}

function offsetInParagraph(pEl: HTMLElement, node: Node, offset: number): number {
  if (node.nodeType !== Node.TEXT_NODE) {
    let total = 0;
    for (let i = 0; i < offset && i < node.childNodes.length; i++) {
      total += node.childNodes[i]?.textContent?.length ?? 0;
    }
    if (node === pEl) return total;
    return offsetInParagraph(pEl, node.parentNode ?? pEl, 0) + total;
  }

  const walker = document.createTreeWalker(pEl, NodeFilter.SHOW_TEXT);
  let total = 0;
  let cur = walker.nextNode();
  while (cur) {
    if (cur === node) return total + offset;
    total += cur.textContent?.length ?? 0;
    cur = walker.nextNode();
  }
  return total;
}

export interface SelectionPart {
  chapterId: string;
  paragraphId: string;
  start: number;
  end: number;
  text: string;
}

export interface ReadSelection {
  parts: SelectionPart[];
  text: string;
  rect: DOMRect;
}

/** Read the current DOM selection and map it onto paragraph character offsets. */
export function readSelection(root: HTMLElement): ReadSelection | null {
  const selection = typeof window !== "undefined" ? window.getSelection() : null;
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const paragraphs = Array.from(root.querySelectorAll<HTMLElement>("[data-pid]"));
  const parts: SelectionPart[] = [];

  for (const pEl of paragraphs) {
    if (!range.intersectsNode(pEl)) continue;
    const full = pEl.textContent ?? "";
    const start = pEl.contains(range.startContainer)
      ? offsetInParagraph(pEl, range.startContainer, range.startOffset)
      : 0;
    const end = pEl.contains(range.endContainer)
      ? offsetInParagraph(pEl, range.endContainer, range.endOffset)
      : full.length;
    if (end <= start) continue;
    const text = full.slice(start, end);
    if (!text.trim()) continue;
    parts.push({
      chapterId: pEl.dataset["cid"] ?? "",
      paragraphId: pEl.dataset["pid"] ?? "",
      start,
      end,
      text,
    });
  }

  if (!parts.length) return null;

  return {
    parts,
    text: parts.map((p) => p.text).join(" ").replace(/\s+/g, " ").trim(),
    rect: range.getBoundingClientRect(),
  };
}

export function clearSelection() {
  if (typeof window === "undefined") return;
  window.getSelection()?.removeAllRanges();
}

export const highlightColorClass: Record<string, string> = {
  yellow: "bg-hl-yellow",
  green: "bg-hl-green",
  blue: "bg-hl-blue",
  pink: "bg-hl-pink",
};

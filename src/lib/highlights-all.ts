import type { Highlight } from "@/lib/reader-storage";

export interface BookHighlights {
  bookId: string;
  highlights: Highlight[];
}

/** يجمع كل التظليلات والملاحظات المخزّنة محلياً لكل الكتب. */
export function loadAllHighlights(): BookHighlights[] {
  if (typeof window === "undefined") return [];
  const out: BookHighlights[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    const match = /^reader:(.+):highlights$/.exec(key);
    if (!match?.[1]) continue;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
      if (Array.isArray(parsed) && parsed.length) {
        out.push({ bookId: match[1], highlights: parsed as Highlight[] });
      }
    } catch {
      /* تجاهل المدخلات التالفة */
    }
  }
  return out;
}

export function removeHighlight(bookId: string, id: string) {
  if (typeof window === "undefined") return;
  const key = `reader:${bookId}:highlights`;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Highlight[];
    window.localStorage.setItem(
      key,
      JSON.stringify(parsed.filter((item) => item.id !== id)),
    );
  } catch {
    /* تجاهل */
  }
}

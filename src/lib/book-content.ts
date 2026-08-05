/**
 * تحويل محتوى الكتاب (مجلدات + ماركداون) إلى بنية يقرأها القارئ،
 * وبناء فهرس شجري من رموز العناوين (#، ##، ###).
 */

export interface BookVolume {
  id: string;
  title: string;
  markdown: string;
}

export interface BookRow {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  description: string | null;
  price: number | null;
  category_id: string | null;
  content: unknown;
  created_at: string;
  updated_at: string;
}

export interface BookBlock {
  id: string;
  text: string;
  /** 1 | 2 | 3 للعناوين، غير موجود للفقرات العادية */
  level?: number;
}

export interface BookChapter {
  id: string;
  title: string;
  paragraphs: BookBlock[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  chapters: BookChapter[];
}

export interface TocNode {
  id: string;
  title: string;
  level: number;
  children: TocNode[];
}

export function toVolumes(content: unknown): BookVolume[] {
  if (!Array.isArray(content)) return [];
  return content
    .filter((item): item is BookVolume => !!item && typeof item === "object")
    .map((item, index) => ({
      id: String(item.id ?? `v${index + 1}`),
      title: String(item.title ?? `الجزء ${index + 1}`),
      markdown: String(item.markdown ?? ""),
    }));
}

/** يحوّل نص ماركداون إلى فقرات وعناوين. */
export function markdownToBlocks(volumeId: string, markdown: string): BookBlock[] {
  const blocks: BookBlock[] = [];
  let counter = 0;

  for (const chunk of markdown.split(/\n\s*\n/)) {
    const buffer: string[] = [];
    const flush = () => {
      const text = buffer.join(" ").replace(/\s+/g, " ").trim();
      buffer.length = 0;
      if (text) blocks.push({ id: `${volumeId}-b${counter++}`, text });
    };

    for (const rawLine of chunk.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      const heading = /^(#{1,3})\s+(.*)$/.exec(line);
      if (heading) {
        flush();
        blocks.push({
          id: `${volumeId}-b${counter++}`,
          text: heading[2]!.trim(),
          level: heading[1]!.length,
        });
      } else {
        buffer.push(line);
      }
    }
    flush();
  }

  return blocks;
}

export function bookFromRow(row: BookRow): Book {
  const volumes = toVolumes(row.content);
  const chapters: BookChapter[] = (
    volumes.length ? volumes : [{ id: "v1", title: "الجزء الأول", markdown: "" }]
  ).map((volume) => ({
    id: volume.id,
    title: volume.title,
    paragraphs: markdownToBlocks(volume.id, volume.markdown),
  }));
  return { id: row.id, title: row.title, author: row.author, chapters };
}

/** فهرس شجري: مجلد ← عنوان رئيسي ← فرعي ← فرعي صغير. */
export function buildToc(book: Book): TocNode[] {
  const roots: TocNode[] = [];

  for (const chapter of book.chapters) {
    const volumeNode: TocNode = {
      id: chapter.id,
      title: chapter.title,
      level: 0,
      children: [],
    };
    roots.push(volumeNode);
    const stack: TocNode[] = [volumeNode];

    for (const block of chapter.paragraphs) {
      if (!block.level) continue;
      const node: TocNode = {
        id: block.id,
        title: block.text,
        level: block.level,
        children: [],
      };
      while (stack.length > 1 && (stack[stack.length - 1]?.level ?? 0) >= block.level) {
        stack.pop();
      }
      stack[stack.length - 1]?.children.push(node);
      stack.push(node);
    }
  }

  return roots;
}

export function totalChars(book: Book) {
  return book.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.paragraphs.reduce((inner, block) => inner + block.text.length, 0),
    0,
  );
}

export function blocksToMarkdown(blocks: BookBlock[]) {
  return blocks
    .map((block) => (block.level ? `${"#".repeat(block.level)} ${block.text}` : block.text))
    .join("\n\n");
}

export function newVolume(index: number): BookVolume {
  return {
    id: `v${index}-${Math.random().toString(36).slice(2, 6)}`,
    title: `الجزء ${index}`,
    markdown: "# عنوان رئيسي\n\nاكتب هنا…",
  };
}

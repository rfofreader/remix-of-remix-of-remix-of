import { sampleBook, type Book, type BookChapter } from "@/data/sample-book";
import { extraBooks } from "@/data/extra-books";

const KEY = "library:books:v1";

export const seedBooks: Book[] = [sampleBook, ...extraBooks];

export function loadLibrary(): Book[] {
  if (typeof window === "undefined") return seedBooks;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedBooks;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return seedBooks;
    return parsed as Book[];
  } catch {
    return seedBooks;
  }
}

export function saveLibrary(books: Book[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(books));
  } catch {
    /* ignore quota errors */
  }
}

export function getBook(id: string): Book | null {
  return loadLibrary().find((book) => book.id === id) ?? null;
}

export function upsertBook(book: Book): Book[] {
  const books = loadLibrary();
  const index = books.findIndex((item) => item.id === book.id);
  const next = index === -1 ? [...books, book] : books.map((item) => (item.id === book.id ? book : item));
  saveLibrary(next);
  return next;
}

export function deleteBook(id: string): Book[] {
  const next = loadLibrary().filter((book) => book.id !== id);
  saveLibrary(next);
  return next;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyChapter(bookId: string, index: number): BookChapter {
  const id = uid(`${bookId}-ch`);
  return {
    id,
    title: `الفصل ${index}`,
    paragraphs: [{ id: `${id}-p0`, text: "" }],
  };
}

export function createBook(): Book {
  const id = uid("book");
  return {
    id,
    title: "كتاب بلا عنوان",
    author: "أنا",
    chapters: [emptyChapter(id, 1)],
  };
}

/** يحوّل نصاً طويلاً إلى فقرات (سطر فارغ = فقرة جديدة). */
export function textToParagraphs(chapterId: string, text: string) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const list = blocks.length ? blocks : [""];
  return list.map((value, index) => ({ id: `${chapterId}-p${index}`, text: value }));
}

export function paragraphsToText(chapter: BookChapter) {
  return chapter.paragraphs.map((paragraph) => paragraph.text).join("\n\n");
}

export function bookWordCount(book: Book) {
  return book.chapters.reduce(
    (sum, chapter) =>
      sum +
      chapter.paragraphs.reduce(
        (inner, paragraph) => inner + paragraph.text.split(/\s+/).filter(Boolean).length,
        0,
      ),
    0,
  );
}

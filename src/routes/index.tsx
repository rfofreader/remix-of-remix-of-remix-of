import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import type { Book } from "@/data/sample-book";
import { loadLibrary, seedBooks } from "@/lib/library";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "أثر الهدوء — مكتبتك الهادئة" },
      {
        name: "description",
        content:
          "مكتبة قراءة عربية بسيطة: اختر كتابك وتابع من حيث توقفت، مع التظليلات والملاحظات المحفوظة على جهازك.",
      },
      { property: "og:title", content: "أثر الهدوء — مكتبتك الهادئة" },
      {
        property: "og:description",
        content: "افتح الكتاب وتابع القراءة من حيث توقفت في تجربة عربية هادئة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [books, setBooks] = useState<Book[]>(seedBooks);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("paper-light");
    document.body.style.backgroundColor = "var(--paper)";
    setBooks(loadLibrary());
    return () => root.classList.remove("paper-light");
  }, []);

  return (
    <main
      dir="rtl"
      className="paper-light min-h-screen bg-paper px-6 py-16"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="pb-12 text-center">
          <p className="text-xs tracking-[0.3em] text-ink-soft uppercase">مكتبتي</p>
          <h1 className="pt-4 font-reading text-4xl leading-relaxed text-ink">أثر الهدوء</h1>
          <p className="pt-3 text-sm text-ink-soft">اقرأ بهدوء، أو اكتب كتابك الخاص.</p>
        </header>

        <ul className="divide-y divide-rule border-y border-rule">
          {books.map((book) => (
            <li key={book.id}>
              <Link
                to="/read/$bookId"
                params={{ bookId: book.id }}
                className="flex items-baseline justify-between gap-4 py-5 transition-opacity active:opacity-60"
              >
                <span>
                  <span className="block font-reading text-xl leading-relaxed text-ink">
                    {book.title}
                  </span>
                  <span className="block pt-1 text-xs text-ink-soft">{book.author}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                  {book.chapters.length} فصول
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/studio"
          className="mt-10 flex items-center justify-center gap-2 rounded-full border border-rule py-3 text-sm text-ink transition-colors hover:bg-rule/40"
        >
          <PenLine className="size-4" />
          لوحة الكتابة
        </Link>

        <footer className="pt-14 text-center text-xs text-ink-soft">
          كل شيء محفوظ على جهازك
        </footer>
      </div>
    </main>
  );
}

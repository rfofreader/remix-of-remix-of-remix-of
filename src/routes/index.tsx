import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Library, PenLine, Search, User } from "lucide-react";
import type { Book } from "@/data/sample-book";
import { loadLibrary, seedBooks } from "@/lib/library";
import { loadProgressRatio } from "@/lib/reader-storage";
import { BookCover } from "@/components/library/BookCover";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مكتبتي — أثر الهدوء" },
      {
        name: "description",
        content:
          "مكتبة قراءة عربية بسيطة: تابع من حيث توقفت، وتصفّح كتبك، واكتب كتابك الخاص من لوحة الكتابة.",
      },
      { property: "og:title", content: "مكتبتي — أثر الهدوء" },
      {
        property: "og:description",
        content: "تابع القراءة من حيث توقفت في تجربة عربية هادئة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [books, setBooks] = useState<Book[]>(seedBooks);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const root = document.documentElement;
    const classes = ["paper-light", "paper-sepia", "paper-dark"];
    root.classList.remove(...classes);
    root.classList.add("paper-sepia");
    document.body.style.backgroundColor = "var(--paper)";
    const list = loadLibrary();
    setBooks(list);
    setProgress(
      Object.fromEntries(list.map((book) => [book.id, loadProgressRatio(book.id)])),
    );
    return () => root.classList.remove("paper-sepia");
  }, []);

  const current = books[0];
  const recent = books.slice(1);
  const currentPercent = current ? Math.round((progress[current.id] ?? 0) * 100) : 0;

  return (
    <main
      dir="rtl"
      className="paper-sepia min-h-screen bg-paper px-5 pt-10 pb-28"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-reading text-3xl leading-tight text-ink">مكتبتي</h1>
            <p className="pt-2 text-sm text-ink-soft">تابع من حيث توقفت</p>
          </div>
          <Link
            to="/studio"
            aria-label="لوحة الكتابة"
            className="flex size-11 items-center justify-center rounded-full bg-panel text-ink shadow-sm transition-transform active:scale-95"
          >
            <Search className="size-5" />
          </Link>
        </header>

        {current ? (
          <section className="mt-6 rounded-[28px] bg-panel p-4 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
            <div className="flex gap-4">
              <BookCover book={current} className="h-[130px] w-[92px] shrink-0" />
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="font-reading text-xl leading-snug text-ink">{current.title}</h2>
                <p className="pt-1 text-xs text-ink-soft">{current.author}</p>
                <div className="pt-6">
                  <p className="pb-1 text-xs font-medium text-ink tabular-nums">
                    {currentPercent}%
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-rule">
                    <div
                      className="h-full rounded-full bg-ink"
                      style={{ width: `${Math.max(2, currentPercent)}%` }}
                    />
                  </div>
                  <p className="pt-2 text-xs text-ink-soft">
                    {current.chapters.length} فصول في هذا الكتاب
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/read/$bookId"
              params={{ bookId: current.id }}
              className="mt-4 flex items-center justify-between rounded-full bg-chrome px-6 py-4 text-sm font-medium text-chrome-ink transition-transform active:scale-[0.98]"
            >
              متابعة القراءة
              <span aria-hidden className="text-lg leading-none">‹</span>
            </Link>
          </section>
        ) : null}

        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-reading text-lg text-ink">حديثاً</h2>
            <Link to="/studio" className="text-xs text-ink-soft">
              الكل
            </Link>
          </div>

          <ul className="mt-4 grid grid-cols-3 gap-3">
            {recent.map((book) => (
              <li key={book.id}>
                <Link
                  to="/read/$bookId"
                  params={{ bookId: book.id }}
                  className="block transition-opacity active:opacity-70"
                >
                  <BookCover book={book} className="aspect-[2/3] w-full" />
                  <p className="pt-2 text-xs leading-5 text-ink">{book.title}</p>
                  <p className="text-[11px] text-ink-soft">{book.author}</p>
                  <p className="pt-0.5 text-[11px] text-ink-soft tabular-nums">
                    {Math.round((progress[book.id] ?? 0) * 100)}%
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-5 pb-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-around rounded-full bg-panel px-4 py-3 shadow-[0_16px_36px_-20px_rgb(0_0_0/0.4)]">
          <span className="flex size-10 items-center justify-center rounded-full bg-rule/70 text-ink">
            <Library className="size-5" />
          </span>
          <Link to="/studio" aria-label="لوحة الكتابة" className="p-2 text-ink-soft">
            <PenLine className="size-5" />
          </Link>
          <span className="p-2 text-ink-soft/50">
            <Compass className="size-5" />
          </span>
          <span className="p-2 text-ink-soft/50">
            <User className="size-5" />
          </span>
        </div>
      </nav>
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { fetchBooks, fetchHistory, type BookWithCategory } from "@/lib/books-api";
import { useAuth } from "@/hooks/use-auth";
import { loadProgressRatio } from "@/lib/reader-storage";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "رفوف - قارئك" },
      { name: "description", content: "حيث لا شيء سوى انت والنص" },
      { property: "og:title", content: "رفوف - قارئك" },
      { property: "og:description", content: "حيث لا شيء سوى انت والنص" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [continueId, setContinueId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchBooks().then((list) => {
      setBooks(list);
      setProgress(
        Object.fromEntries(list.map((book) => [book.id, loadProgressRatio(book.id)])),
      );
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetchHistory(user.id).then((rows) => {
      setProgress((current) => ({
        ...current,
        ...Object.fromEntries(rows.map((row) => [row.book_id, row.ratio])),
      }));
      setContinueId(rows[0]?.book_id ?? null);
    });
  }, [user]);

  const current = books.find((book) => book.id === continueId) ?? books[0];
  const rest = books.filter((book) => book.id !== current?.id);
  const currentPercent = current ? Math.round((progress[current.id] ?? 0) * 100) : 0;

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return books.filter(
      (book) => book.title.includes(q) || book.author.includes(q),
    );
  }, [query, books]);

  return (
    <AppPage
      hideBack
      header={
        <header className="flex items-end justify-between gap-4 pt-6">
          <div className="text-right">
            <h1 className="font-reading text-4xl leading-tight font-semibold text-ink">رفوفي</h1>
            <p className="pt-1 text-lg text-ink-soft">تابع من حيث توقفت</p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="بحث"
            className="flex size-16 items-center justify-center rounded-2xl bg-panel text-ink shadow-sm transition-transform active:scale-95"
          >
            <Search className="size-6" />
          </button>
        </header>

      }
    >

      {current ? (
        <section className="mt-6 rounded-lg bg-panel p-4 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
          <div className="flex gap-4">
            <BookCover book={current} className="h-[150px] w-[106px] shrink-0" />
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="font-reading text-xl leading-snug text-ink">{current.title}</h1>
              <p className="pt-1 text-xs text-ink-soft">{current.author}</p>
              <div className="pt-8">
                <p className="pb-1 text-xs font-medium text-ink tabular-nums">{currentPercent}%</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-rule">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.max(2, currentPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/read/$bookId"
            params={{ bookId: current.id }}
            className="mt-4 flex items-center justify-between rounded-lg bg-brand px-6 py-4 text-sm font-medium text-brand-ink transition-transform active:scale-[0.98]"
          >
            متابعة القراءة
            <span aria-hidden className="text-lg leading-none">
              ‹
            </span>
          </Link>
        </section>
      ) : (
        <p className="mt-10 text-center text-sm text-ink-soft">لا توجد كتب منشورة بعد.</p>
      )}

      {rest.length ? (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-reading text-lg text-ink">حديثاً</h2>
            <Link to="/library" className="text-xs text-ink-soft">
              الكل
            </Link>
          </div>

          <ul className="mt-4 grid grid-cols-3 gap-3">
            {rest.slice(0, 9).map((book) => (
              <li key={book.id}>
                <Link
                  to="/book/$bookId"
                  params={{ bookId: book.id }}
                  className="block transition-opacity active:opacity-70"
                >
                  <BookCover book={book} className="aspect-[2/3] w-full" />
                  <p className="pt-2 line-clamp-2 text-xs leading-5 text-ink">{book.title}</p>
                  <p className="text-[11px] text-ink-soft">{book.author}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {searchOpen ? (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/35 px-4 pt-16 backdrop-blur-[2px]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-panel p-4 text-panel-ink shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Search className="size-4 shrink-0 text-panel-ink/50" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث عن كتاب أو مؤلف…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-panel-ink/45"
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="إغلاق"
                className="rounded-full p-1.5 text-panel-ink/60"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
              {results.map((book) => (
                <li key={book.id}>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      void navigate({ to: "/book/$bookId", params: { bookId: book.id } });
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-right transition-colors hover:bg-panel-rule"
                  >
                    <BookCover book={book} className="h-12 w-9 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{book.title}</span>
                      <span className="block text-xs text-panel-ink/55">{book.author}</span>
                    </span>
                  </button>
                </li>
              ))}
              {query.trim() && results.length === 0 ? (
                <li className="py-8 text-center text-sm text-panel-ink/55">لا توجد نتائج</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </AppPage>
  );
}

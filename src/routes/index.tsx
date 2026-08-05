import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { fetchBooks, fetchHistory, type BookWithCategory } from "@/lib/books-api";
import { useAuth } from "@/hooks/use-auth";
import { loadProgressRatio } from "@/lib/reader-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — أثر الهدوء" },
      {
        name: "description",
        content: "تابع من حيث توقفت، وتصفّح أحدث الكتب في مكتبة أثر الهدوء العربية.",
      },
      { property: "og:title", content: "الرئيسية — أثر الهدوء" },
      { property: "og:description", content: "تابع القراءة من حيث توقفت في تجربة عربية هادئة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [continueId, setContinueId] = useState<string | null>(null);

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

  return (
    <AppPage
      title="أثر الهدوء"
      subtitle="تابع من حيث توقفت"
      action={
        <Link
          to="/library"
          aria-label="المكتبة"
          className="flex size-11 items-center justify-center rounded-lg bg-panel text-ink shadow-sm transition-transform active:scale-95"
        >
          <Search className="size-5" />
        </Link>
      }
    >
      {current ? (
        <section className="mt-6 rounded-lg bg-panel p-4 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
          <div className="flex gap-4">
            <BookCover book={current} className="h-[130px] w-[92px] shrink-0" />
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="font-reading text-xl leading-snug text-ink">{current.title}</h2>
              <p className="pt-1 text-xs text-ink-soft">{current.author}</p>
              <div className="pt-6">
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
    </AppPage>
  );
}

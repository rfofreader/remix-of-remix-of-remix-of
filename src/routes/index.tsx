import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PenLine } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { BookGrid } from "@/components/library/BookGrid";
import { Logo } from "@/components/brand/Logo";
import { QuoteBanner } from "@/components/home/QuoteBanner";
import { CloseIcon, SearchIcon } from "@/components/icons/AppIcons";
import {
  fetchBooks,
  fetchFavorites,
  fetchHistory,
  type BookWithCategory,
} from "@/lib/books-api";
import { useAuth } from "@/hooks/use-auth";
import { loadProgressRatio } from "@/lib/reader-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "رفوف - قارئك" },
      { name: "description", content: "حيث لا شيء سوى أنت والنص" },
      { property: "og:title", content: "رفوف - قارئك" },
      { property: "og:description", content: "حيث لا شيء سوى أنت والنص" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const quotes = [
  { text: "القراءة وحدها تمنحك حياةً أطول من حياتك", author: "شهاب الدين" },
  { text: "الكتاب صديقٌ لا يخون، وصمتٌ لا يُوحش", author: "ابن الجوزي" },
  { text: "من لم يذق مرّ التعلّم ساعة، تجرّع ذلّ الجهل دهرًا", author: "الشافعي" },
];

function HomePage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [mine, setMine] = useState<BookWithCategory[]>([]);
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
    void fetchFavorites(user.id).then((rows) =>
      setMine(rows.map((row) => row.books).filter((book): book is BookWithCategory => !!book)),
    );
  }, [user]);

  const quote = quotes[new Date().getDate() % quotes.length]!;

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return books.filter((book) => book.title.includes(q) || book.author.includes(q));
  }, [query, books]);

  return (
    <AppPage
      hideBack
      navExtra={
        isAdmin ? (
          <Link
            to="/studio"
            aria-label="لوحة النشر"
            className="pointer-events-auto grid size-12 place-items-center rounded-full bg-panel text-panel-ink shadow-[0_14px_28px_-14px_rgb(0_0_0/0.7)] transition-transform active:scale-95"
          >
            <PenLine className="size-5" />
          </Link>
        ) : null
      }
      header={
        <header className="flex items-start justify-between gap-4 pt-4">
          <div className="text-right">
            <Logo className="text-4xl" />
            <p className="pt-2 text-sm font-medium text-ink">حيث لا شيء سوى أنت والنص</p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="بحث"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-panel text-panel-ink transition-transform active:scale-95"
          >
            <SearchIcon className="size-4" />
          </button>
        </header>
      }
    >

      <QuoteBanner text={quote.text} author={quote.author} />

      <section className="mt-7">
        <h2 className="text-right text-base font-semibold text-ink">أحدث الكتب</h2>
        {books.length ? (
          <BookGrid books={books.slice(0, 3)} showCategory />
        ) : (
          <p className="mt-4 text-center text-sm text-ink-soft">لا توجد كتب منشورة بعد.</p>
        )}
      </section>

      <section className="mt-7">
        <h2 className="text-right text-base font-semibold text-ink">رفوفي</h2>
        {mine.length ? (
          <BookGrid books={mine.slice(0, 3)} />
        ) : (
          <p className="mt-4 text-center text-sm text-ink-soft">
            لم تُضِف كتباً إلى مكتبتك بعد.
          </p>
        )}
      </section>

      <div className="h-32" />


      {searchOpen ? (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/35 px-4 pt-16 backdrop-blur-[2px]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-panel p-4 text-panel-ink"
          >
            <div className="flex items-center gap-2">
              <SearchIcon className="size-4 shrink-0 text-panel-ink/60" />
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
                className="rounded-full p-1.5 text-panel-ink/70"
              >
                <CloseIcon className="size-4" />
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
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-right transition-colors hover:bg-panel-rule"
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { BookGrid } from "@/components/library/BookGrid";
import { BookCover } from "@/components/library/BookCover";
import { fetchBooks, type BookWithCategory } from "@/lib/books-api";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "المتجر — رفوف" },
      { name: "description", content: "كتب مجانية ومدفوعة يمكنك إضافتها إلى مكتبتك في رفوف." },
      { property: "og:title", content: "المتجر — رفوف" },
      { property: "og:description", content: "كتب مجانية ومدفوعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorePage,
});

function price(book: BookWithCategory) {
  return Number(book.price) > 0 ? `${book.price} ر.س` : "مجاني";
}

function StorePage() {
  const [books, setBooks] = useState<BookWithCategory[]>([]);

  useEffect(() => {
    void fetchBooks().then(setBooks);
  }, []);

  const featured = books[0];
  const rest = books.slice(1);

  return (
    <AppPage
      header={
        <header className="pt-4 text-right">
          <h1 className="font-reading text-3xl leading-tight font-semibold text-ink">المتجر</h1>
          <p className="pt-1 text-sm text-ink-soft">اختر كتابك التالي</p>
        </header>
      }
    >
      {featured ? (
        <section className="mt-5 rounded-[1.75rem] bg-panel p-4 text-panel-ink">
          <div className="flex gap-4">
            <BookCover book={featured} className="h-[150px] w-[112px] shrink-0" />
            <div className="min-w-0 flex-1 pt-1 text-right">
              <h2 className="font-reading text-xl leading-snug">{featured.title}</h2>
              <p className="pt-1 text-xs text-panel-ink/70">{featured.author}</p>
              {featured.description ? (
                <p className="mt-3 line-clamp-4 text-[11px] leading-5 text-panel-ink/70">
                  {featured.description}
                </p>
              ) : null}
            </div>
          </div>

          <Link
            to="/book/$bookId"
            params={{ bookId: featured.id }}
            className="mt-4 flex items-center justify-between rounded-2xl bg-paper px-6 py-4 text-sm font-medium text-ink transition-transform active:scale-[0.98]"
          >
            {price(featured)}
            <span aria-hidden className="text-lg leading-none">
              ‹
            </span>
          </Link>
        </section>
      ) : (
        <p className="mt-10 text-center text-sm text-ink-soft">لا توجد كتب في المتجر بعد.</p>
      )}

      {rest.length ? (
        <section className="mt-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-ink">كل الكتب</h2>
            <Link to="/library" className="text-xs text-ink-soft">
              الكل
            </Link>
          </div>
          <BookGrid books={rest} />
        </section>
      ) : null}
    </AppPage>
  );
}

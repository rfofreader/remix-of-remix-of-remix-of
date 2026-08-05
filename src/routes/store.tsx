import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { fetchBooks, type BookWithCategory } from "@/lib/books-api";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "المتجر — أثر الهدوء" },
      { name: "description", content: "كتب مجانية ومدفوعة يمكنك إضافتها إلى مكتبتك." },
      { property: "og:title", content: "المتجر — أثر الهدوء" },
      { property: "og:description", content: "كتب مجانية ومدفوعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const [books, setBooks] = useState<BookWithCategory[]>([]);

  useEffect(() => {
    void fetchBooks().then(setBooks);
  }, []);

  return (
    <AppPage title="المتجر" subtitle="اختر كتابك التالي">
      <ul className="mt-6 space-y-3">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              to="/book/$bookId"
              params={{ bookId: book.id }}
              className="flex gap-3 rounded-lg bg-panel p-3"
            >
              <BookCover book={book} className="h-24 w-16 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-reading text-base leading-snug text-ink">
                  {book.title}
                </span>
                <span className="block pt-1 text-xs text-ink-soft">{book.author}</span>
                {book.description ? (
                  <span className="mt-2 line-clamp-2 block text-[11px] leading-5 text-ink-soft">
                    {book.description}
                  </span>
                ) : null}
              </span>
              <span className="self-end rounded-lg bg-brand px-3 py-1.5 text-[11px] font-medium text-brand-ink">
                {Number(book.price) > 0 ? `${book.price} ر.س` : "مجاني"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {books.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-soft">لا توجد كتب في المتجر بعد.</p>
      ) : null}
    </AppPage>
  );
}

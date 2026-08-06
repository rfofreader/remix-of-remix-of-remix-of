import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import {
  fetchBooks,
  fetchCategories,
  type BookWithCategory,
  type CategoryRow,
} from "@/lib/books-api";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "التصنيفات — رفوفي" },
      { name: "description", content: "تصفّح الكتب حسب التصنيف: فكر، أدب، تاريخ وغيرها." },
      { property: "og:title", content: "التصنيفات — رفوفي" },
      { property: "og:description", content: "تصفّح الكتب حسب التصنيف." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [books, setBooks] = useState<BookWithCategory[]>([]);

  useEffect(() => {
    void fetchCategories().then(setCategories);
    void fetchBooks().then(setBooks);
  }, []);

  const uncategorized = books.filter((book) => !book.category_id);

  return (
    <AppPage title="التصنيفات" subtitle={`${categories.length} تصنيف`}>
      {categories.map((category) => {
        const list = books.filter((book) => book.category_id === category.id);
        return (
          <Section key={category.id} title={category.name} books={list} />
        );
      })}

      {uncategorized.length ? (
        <Section title="غير مصنّف" books={uncategorized} />
      ) : null}
    </AppPage>
  );
}

function Section({ title, books }: { title: string; books: BookWithCategory[] }) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between pb-3">
        <h2 className="font-reading text-lg text-ink">{title}</h2>
        <Link to="/library" className="text-xs text-ink-soft">
          الكل
        </Link>
      </div>
      {books.length ? (
        <ul className="grid grid-cols-3 gap-3">
          {books.slice(0, 3).map((book) => (
            <li key={book.id}>
              <Link to="/book/$bookId" params={{ bookId: book.id }}>
                <BookCover book={book} className="aspect-[2/3] w-full" />
                <p className="pt-2 line-clamp-2 text-xs leading-5 text-ink">{book.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">لا توجد كتب في هذا التصنيف.</p>
      )}
    </section>
  );
}

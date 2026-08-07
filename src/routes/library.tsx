import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { Input } from "@/components/ui/input";
import {
  fetchBooks,
  fetchCategories,
  type BookWithCategory,
  type CategoryRow,
} from "@/lib/books-api";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "المكتبة — أثر الهدوء" },
      { name: "description", content: "تصفّح كل الكتب المتاحة وابحث فيها حسب العنوان أو المؤلف." },
      { property: "og:title", content: "المكتبة — أثر الهدوء" },
      { property: "og:description", content: "كل الكتب في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    void fetchBooks().then(setBooks);
    void fetchCategories().then(setCategories);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return books.filter(
      (book) =>
        (!category || book.category_id === category) &&
        (!q || book.title.includes(q) || book.author.includes(q)),
    );
  }, [books, query, category]);

  return (
    <AppPage title="المكتبة" subtitle={`${books.length} كتاب`}>
      <div className="relative mt-5">
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-soft" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث عن كتاب أو مؤلف…"
          className="h-11 rounded-lg border-rule bg-paper pr-9 text-ink placeholder:text-ink-soft"
        />
      </div>

      {categories.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={category === null} onClick={() => setCategory(null)} label="الكل" />
          {categories.map((item) => (
            <Chip
              key={item.id}
              active={category === item.id}
              onClick={() => setCategory(item.id)}
              label={item.name}
            />
          ))}
        </div>
      ) : null}

      <ul className="mt-6 grid grid-cols-3 gap-3">
        {filtered.map((book) => (
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

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-soft">لا توجد نتائج.</p>
      ) : null}
    </AppPage>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
        active ? "bg-brand text-brand-ink" : "bg-panel text-panel-ink/70"
      }`}
    >
      {label}
    </button>
  );
}

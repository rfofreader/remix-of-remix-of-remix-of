import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { fetchAuthor, fetchBooks, type AuthorRow, type BookWithCategory } from "@/lib/books-api";

export const Route = createFileRoute("/author/$authorId")({
  head: () => ({
    meta: [
      { title: "صفحة المؤلف — رفوفي" },
      { name: "description", content: "نبذة عن المؤلف وكل كتبه المتاحة في رفوفي." },
      { property: "og:title", content: "صفحة المؤلف — رفوفي" },
      { property: "og:description", content: "نبذة عن المؤلف وكتبه." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthorPage,
});

function AuthorPage() {
  const { authorId } = Route.useParams();
  const [author, setAuthor] = useState<AuthorRow | null>(null);
  const [books, setBooks] = useState<BookWithCategory[]>([]);

  useEffect(() => {
    void fetchAuthor(authorId).then(setAuthor);
    void fetchBooks().then(setBooks);
  }, [authorId]);

  const own = books.filter((book) => book.author_id === authorId);
  const featured = own[0];
  const rest = own.slice(1);

  return (
    <AppPage
      header={
        <header className="flex items-end justify-between gap-4 pt-6">
          <div className="text-right">
            <h1 className="font-reading text-4xl leading-tight font-semibold text-ink">
              {author?.name ?? "…"}
            </h1>
            <p className="pt-1 text-lg text-ink-soft">{own.length} كتاب</p>
          </div>
          {author?.photo_url ? (
            <img
              src={author.photo_url}
              alt={author.name}
              className="size-16 rounded-2xl object-cover shadow-sm"
            />
          ) : null}
        </header>
      }
    >
      {author?.bio ? (
        <p className="mt-6 rounded-lg bg-panel p-4 text-sm leading-7 text-ink">{author.bio}</p>
      ) : null}

      {featured ? (
        <section className="mt-6 rounded-lg bg-panel p-4 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
          <div className="flex gap-4">
            <BookCover book={featured} className="h-[150px] w-[106px] shrink-0" />
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="font-reading text-xl leading-snug text-ink">{featured.title}</h2>
              <p className="pt-1 text-xs text-ink-soft">{featured.author}</p>
              {featured.description ? (
                <p className="mt-3 line-clamp-4 text-[11px] leading-5 text-ink-soft">
                  {featured.description}
                </p>
              ) : null}
            </div>
          </div>
          <Link
            to="/book/$bookId"
            params={{ bookId: featured.id }}
            className="mt-4 flex items-center justify-between rounded-lg bg-brand px-6 py-4 text-sm font-medium text-brand-ink transition-transform active:scale-[0.98]"
          >
            تفاصيل الكتاب
            <span aria-hidden className="text-lg leading-none">
              ‹
            </span>
          </Link>
        </section>
      ) : (
        <p className="mt-10 text-center text-sm text-ink-soft">لا توجد كتب لهذا المؤلف بعد.</p>
      )}

      {rest.length ? (
        <section className="mt-8">
          <h2 className="font-reading text-lg text-ink">أعمال أخرى</h2>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {rest.map((book) => (
              <li key={book.id}>
                <Link to="/book/$bookId" params={{ bookId: book.id }} className="block">
                  <BookCover book={book} className="aspect-[2/3] w-full" />
                  <p className="pt-2 line-clamp-2 text-xs leading-5 text-ink">{book.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppPage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchBook, fetchBooks, toggleFavorite, type BookWithCategory } from "@/lib/books-api";

export const Route = createFileRoute("/book/$bookId")({
  head: () => ({
    meta: [
      { title: "تفاصيل الكتاب — أثر الهدوء" },
      { name: "description", content: "بيانات الكتاب ومحتوياته قبل بدء القراءة." },
      { property: "og:title", content: "تفاصيل الكتاب — أثر الهدوء" },
      { property: "og:description", content: "بيانات الكتاب ومحتوياته." },
      { property: "og:type", content: "book" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookDetailPage,
});

function BookDetailPage() {
  const { bookId } = Route.useParams();
  const { user } = useAuth();
  const [row, setRow] = useState<BookWithCategory | null>(null);
  const [all, setAll] = useState<BookWithCategory[]>([]);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    void fetchBook(bookId).then(setRow);
    void fetchBooks().then(setAll);
  }, [bookId]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("favorites")
      .select("book_id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle()
      .then(({ data }) => setFavorite(!!data));
  }, [user, bookId]);

  const others = all.filter((item) => item.id !== bookId);
  /* اقرأ أيضاً: من التصنيف نفسه — توصيات: بقية الكتب الحديثة */
  const related = others.filter((item) => item.category_id && item.category_id === row?.category_id);
  const relatedIds = new Set(related.map((item) => item.id));
  const recommendations = others.filter((item) => !relatedIds.has(item.id)).slice(0, 8);

  if (!row) return <AppPage title="…">{null}</AppPage>;



  const onToggleFavorite = async () => {
    if (!user) {
      toast.error("سجّل الدخول أولاً");
      return;
    }
    const next = !favorite;
    setFavorite(next);
    try {
      await toggleFavorite(user.id, bookId, next);
    } catch {
      setFavorite(!next);
      toast.error("تعذّر التحديث");
    }
  };

  return (
    <AppPage title={row.title} subtitle={row.author}>
      <section className="mt-6 flex gap-4">
        <BookCover book={row} className="h-[170px] w-[118px] shrink-0" />
        <dl className="flex-1 space-y-1.5 text-xs text-ink-soft">
          {row.publisher ? <Row label="الناشر" value={row.publisher} /> : null}
          {row.published_date ? <Row label="تاريخ النشر" value={row.published_date} /> : null}
          {row.page_count ? <Row label="عدد الصفحات" value={String(row.page_count)} /> : null}
          {row.categories ? <Row label="التصنيف" value={row.categories.name} /> : null}
          <Row label="السعر" value={Number(row.price) > 0 ? `${row.price} ر.س` : "مجاني"} />
        </dl>
      </section>

      {row.description ? (
        <p className="mt-5 text-sm leading-7 text-ink">{row.description}</p>
      ) : null}

      <div className="mt-5 flex gap-2">
        <Link
          to="/read/$bookId"
          params={{ bookId }}
          className="flex-1 rounded-lg bg-brand py-3.5 text-center text-sm font-medium text-brand-ink"
        >
          ابدأ القراءة
        </Link>
        <button
          onClick={() => void onToggleFavorite()}
          aria-label="المفضلة"
          className={`flex size-12 items-center justify-center rounded-lg ${
            favorite ? "bg-brand text-brand-ink" : "bg-panel text-ink"
          }`}
        >
          <Heart className={`size-5 ${favorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <BookRail title="توصيات" books={recommendations} />
      <BookRail title="اقرأ أيضاً" books={related} />

    </AppPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function BookRail({ title, books }: { title: string; books: BookWithCategory[] }) {
  if (books.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="pb-3 font-reading text-lg text-ink">{title}</h2>
      <ul className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {books.map((book) => (
          <li key={book.id} className="w-[104px] shrink-0">
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
  );
}

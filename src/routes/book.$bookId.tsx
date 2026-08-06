import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchBook, toggleFavorite, type BookWithCategory } from "@/lib/books-api";
import { bookFromRow, buildToc } from "@/lib/book-content";

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
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    void fetchBook(bookId).then(setRow);
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

  if (!row) return <AppPage title="…">{null}</AppPage>;

  const book = bookFromRow(row);
  const toc = buildToc(book);

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

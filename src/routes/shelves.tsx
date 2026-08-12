import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { BookGrid } from "@/components/library/BookGrid";
import { useAuth } from "@/hooks/use-auth";
import { fetchFavorites, fetchHistory, type BookWithCategory } from "@/lib/books-api";

export const Route = createFileRoute("/shelves")({
  head: () => ({
    meta: [
      { title: "رفوفي — كتبك الخاصة" },
      { name: "description", content: "رفوفك الشخصية: ما تقرأه الآن، وما أنهيته، وما حفظته للاحقاً." },
      { property: "og:title", content: "رفوفي — كتبك الخاصة" },
      { property: "og:description", content: "رفوف شخصية لكل قراءاتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShelvesPage,
});

function ShelvesPage() {
  const { user, loading } = useAuth();
  const [reading, setReading] = useState<BookWithCategory[]>([]);
  const [finished, setFinished] = useState<BookWithCategory[]>([]);
  const [saved, setSaved] = useState<BookWithCategory[]>([]);

  useEffect(() => {
    if (!user) return;
    void fetchHistory(user.id).then((rows) => {
      const withBook = rows.filter((row) => !!row.books);
      setReading(
        withBook.filter((row) => row.ratio < 0.98).map((row) => row.books as BookWithCategory),
      );
      setFinished(
        withBook.filter((row) => row.ratio >= 0.98).map((row) => row.books as BookWithCategory),
      );
    });
    void fetchFavorites(user.id).then((rows) =>
      setSaved(rows.map((row) => row.books).filter((book): book is BookWithCategory => !!book)),
    );
  }, [user]);

  return (
    <AppPage title="رفوفي" subtitle="كل ما تقرأه وتحفظه في مكان واحد">
      {!loading && !user ? (
        <p className="mt-10 text-center text-sm text-ink-soft">سجّل الدخول لتظهر رفوفك هنا.</p>
      ) : (
        <>
          <Shelf title="أقرأ الآن" books={reading} empty="لم تبدأ قراءة أي كتاب بعد." />
          <Shelf title="محفوظة" books={saved} empty="لم تحفظ كتباً بعد." />
          <Shelf title="أنهيتها" books={finished} empty="لا كتب مكتملة بعد." />
        </>
      )}
    </AppPage>
  );
}

function Shelf({ title, books, empty }: { title: string; books: BookWithCategory[]; empty: string }) {
  return (
    <section className="mt-7">
      <h2 className="text-right text-base font-semibold text-ink">{title}</h2>
      {books.length ? (
        <BookGrid books={books} />
      ) : (
        <p className="mt-3 text-right text-sm text-ink-soft">{empty}</p>
      )}
    </section>
  );
}

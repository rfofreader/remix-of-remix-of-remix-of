import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, PenLine } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchFavorites, fetchHistory, type BookWithCategory } from "@/lib/books-api";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي — أثر الهدوء" },
      { name: "description", content: "مفضّلتك وسجل قراءتك وإعدادات حسابك." },
      { property: "og:title", content: "حسابي — أثر الهدوء" },
      { property: "og:description", content: "مفضّلتك وسجل قراءتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { loading, user, isAdmin, displayName } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [favorites, setFavorites] = useState<BookWithCategory[]>([]);
  const [history, setHistory] = useState<{ book: BookWithCategory; ratio: number }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    void fetchFavorites(user.id).then((rows) =>
      setFavorites(rows.map((row) => row.books).filter((book): book is BookWithCategory => !!book)),
    );
    void fetchHistory(user.id).then((rows) =>
      setHistory(
        rows
          .filter((row) => row.books)
          .map((row) => ({ book: row.books as BookWithCategory, ratio: row.ratio })),
      ),
    );
  }, [loading, user, navigate]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  if (!user) return <AppPage title="حسابي">{null}</AppPage>;

  return (
    <AppPage title="حسابي" subtitle={displayName || user.email || ""}>
      <div className="mt-6 space-y-2">
        {isAdmin ? (
          <Link
            to="/studio"
            className="flex items-center gap-2 rounded-lg bg-panel px-4 py-3.5 text-sm text-ink"
          >
            <PenLine className="size-4 text-ink-soft" />
            لوحة الكتابة
          </Link>
        ) : null}
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-lg bg-panel px-4 py-3.5 text-sm text-ink"
        >
          <LogOut className="size-4 text-ink-soft" />
          تسجيل الخروج
        </button>
      </div>

      <Section title="المفضلة" icon={<Heart className="size-4 text-ink-soft" />}>
        {favorites.length ? (
          <ul className="grid grid-cols-3 gap-3">
            {favorites.map((book) => (
              <li key={book.id}>
                <Link to="/book/$bookId" params={{ bookId: book.id }}>
                  <BookCover book={book} className="aspect-[2/3] w-full" />
                  <p className="pt-2 line-clamp-2 text-xs leading-5 text-ink">{book.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">لا توجد كتب في المفضلة.</p>
        )}
      </Section>

      <Section title="سجل القراءة">
        {history.length ? (
          <ul className="space-y-2">
            {history.map(({ book, ratio }) => (
              <li key={book.id}>
                <Link
                  to="/read/$bookId"
                  params={{ bookId: book.id }}
                  className="flex items-center gap-3 rounded-lg bg-panel px-3 py-3"
                >
                  <BookCover book={book} className="h-14 w-10 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{book.title}</span>
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-rule">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${Math.max(2, Math.round(ratio * 100))}%` }}
                      />
                    </span>
                  </span>
                  <span className="text-[11px] text-ink-soft tabular-nums">
                    {Math.round(ratio * 100)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">لم تبدأ أي كتاب بعد.</p>
        )}
      </Section>
    </AppPage>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 pb-3 font-reading text-lg text-ink">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

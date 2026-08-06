import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { fetchBooks, type BookWithCategory } from "@/lib/books-api";
import { highlightColorClass } from "@/lib/reader-selection";
import { loadAllHighlights, removeHighlight, type BookHighlights } from "@/lib/highlights-all";

export const Route = createFileRoute("/highlights")({
  head: () => ({
    meta: [
      { title: "التظليلات — رفوفي" },
      {
        name: "description",
        content: "كل ما ظلّلته ودوّنته أثناء القراءة، مجموعاً في مكان واحد حسب الكتاب.",
      },
      { property: "og:title", content: "التظليلات — رفوفي" },
      { property: "og:description", content: "تظليلاتك وملاحظاتك في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HighlightsPage,
});

function HighlightsPage() {
  const [groups, setGroups] = useState<BookHighlights[]>([]);
  const [books, setBooks] = useState<BookWithCategory[]>([]);

  useEffect(() => {
    setGroups(loadAllHighlights());
    void fetchBooks().then(setBooks);
  }, []);

  const titleOf = useMemo(
    () => (id: string) => books.find((book) => book.id === id)?.title ?? "كتاب",
    [books],
  );

  const total = groups.reduce((sum, group) => sum + group.highlights.length, 0);

  return (
    <AppPage title="التظليلات" subtitle={`${total} تظليل وملاحظة`}>
      {groups.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-soft">
          لم تُظلّل شيئاً بعد. ظلّل نصاً أثناء القراءة ليظهر هنا.
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.bookId} className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-reading text-lg text-ink">{titleOf(group.bookId)}</h2>
            <Link
              to="/read/$bookId"
              params={{ bookId: group.bookId }}
              className="text-xs text-ink-soft"
            >
              فتح الكتاب
            </Link>
          </div>

          <ul className="mt-3 space-y-3">
            {[...group.highlights]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((highlight) => (
                <li key={highlight.id} className="rounded-lg bg-panel p-3">
                  <p className="font-reading text-[15px] leading-8 text-panel-ink">
                    <span
                      className={`rounded-sm px-0.5 ${
                        highlightColorClass[highlight.color] ?? "bg-hl-yellow"
                      }`}
                    >
                      {highlight.text}
                    </span>
                  </p>
                  {highlight.note ? (
                    <p className="mt-2 rounded-lg bg-panel-rule p-2 text-xs leading-6 text-panel-ink/80">
                      {highlight.note}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-panel-ink/50">
                      {new Date(highlight.createdAt).toLocaleDateString("ar")}
                    </span>
                    <button
                      aria-label="حذف التظليل"
                      onClick={() => {
                        removeHighlight(group.bookId, highlight.id);
                        setGroups(loadAllHighlights());
                      }}
                      className="text-panel-ink/50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </AppPage>
  );
}

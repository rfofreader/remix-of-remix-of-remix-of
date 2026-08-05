import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookOpen, Highlighter } from "lucide-react";
import { sampleBook } from "@/data/sample-book";
import { loadHighlights, loadProgress } from "@/lib/reader-storage";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "أثر الهدوء — مكتبتك الهادئة" },
      {
        name: "description",
        content:
          "مكتبة قراءة عربية بسيطة: اختر كتابك وتابع من حيث توقفت، مع التظليلات والملاحظات المحفوظة على جهازك.",
      },
      { property: "og:title", content: "أثر الهدوء — مكتبتك الهادئة" },
      {
        property: "og:description",
        content: "افتح الكتاب وتابع القراءة من حيث توقفت في تجربة عربية هادئة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const book = sampleBook;
  const [percent, setPercent] = useState(0);
  const [highlightCount, setHighlightCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("paper-light");
    setHighlightCount(loadHighlights(book.id).length);
    const saved = loadProgress(book.id);
    setPercent(saved > 0 ? Math.min(99, Math.max(1, Math.round((saved / 6000) * 100))) : 0);
    return () => root.classList.remove("paper-light");
  }, [book.id]);

  const chapters = book.chapters.length;

  return (
    <main
      dir="rtl"
      className="paper-light min-h-screen bg-paper px-6 py-16"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="pb-14 text-center">
          <p className="font-ui text-xs tracking-[0.3em] text-ink-soft uppercase">مكتبتي</p>
          <h1 className="pt-4 font-reading text-4xl leading-relaxed text-ink">أثر الهدوء</h1>
          <p className="pt-3 font-ui text-sm text-ink-soft">
            اقرأ بهدوء. ظلّل ما يلمسك، ودوّن ما يبقى.
          </p>
        </header>

        <Link
          to="/read"
          className="block rounded-3xl border border-panel-rule bg-panel/75 p-6 text-panel-ink shadow-2xl backdrop-blur-2xl transition-transform active:scale-[0.99]"
        >
          <p className="font-reading text-2xl leading-relaxed">{book.title}</p>
          <p className="pt-1 text-sm text-panel-ink/60">{book.author}</p>

          <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-panel-rule">
            <div
              className="h-full rounded-full bg-panel-ink/80"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-4 text-xs text-panel-ink/60">
            <span className="tabular-nums">
              {percent > 0 ? `تابعت ${percent}%` : "لم تبدأ بعد"}
            </span>
            <span className="tabular-nums">{chapters} فصول</span>
          </div>

          <span className="mt-6 flex items-center justify-center gap-2 rounded-full bg-panel-ink py-3 text-sm font-medium text-panel">
            <BookOpen className="size-4" />
            {percent > 0 ? "متابعة القراءة" : "ابدأ القراءة"}
          </span>
        </Link>

        <div className="pt-6">
          <div className="flex items-center justify-between rounded-2xl border border-ink-soft/15 px-5 py-4 text-sm text-ink-soft">
            <span className="flex items-center gap-2">
              <Highlighter className="size-4" />
              التظليلات والملاحظات
            </span>
            <span className="tabular-nums">{highlightCount}</span>
          </div>
        </div>

        <footer className="pt-16 text-center font-ui text-xs text-ink-soft">
          كل شيء محفوظ على جهازك
        </footer>
      </div>
    </main>
  );
}

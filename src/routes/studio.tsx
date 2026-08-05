import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Eraser,
  List,
  Plus,
  Quote,
  Trash2,
  WrapText,
} from "lucide-react";
import { toast } from "sonner";
import type { Book } from "@/data/sample-book";
import {
  createBook,
  deleteBook,
  emptyChapter,
  loadLibrary,
  seedBooks,
  textToParagraphs,
  upsertBook,
} from "@/lib/library";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "لوحة الكتابة — أثر الهدوء" },
      {
        name: "description",
        content:
          "لوحة تحكم محلية لكتابة وتحرير الكتب: أضف الفصول، نسّق النص، واحفظ كل شيء على جهازك.",
      },
      { property: "og:title", content: "لوحة الكتابة — أثر الهدوء" },
      {
        property: "og:description",
        content: "اكتب كتابك وحرّر فصوله بأدوات تنسيق بسيطة، والحفظ محلي بالكامل.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const [books, setBooks] = useState<Book[]>(seedBooks);
  const [activeId, setActiveId] = useState<string>(seedBooks[0]?.id ?? "");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("paper-light");
    document.body.style.backgroundColor = "var(--paper)";
    const list = loadLibrary();
    setBooks(list);
    setActiveId(list[0]?.id ?? "");
    return () => root.classList.remove("paper-light");
  }, []);

  const book = useMemo(
    () => books.find((item) => item.id === activeId) ?? books[0],
    [books, activeId],
  );
  const chapter = book?.chapters[chapterIndex] ?? book?.chapters[0];

  useEffect(() => {
    setDraft(chapter ? chapter.paragraphs.map((p) => p.text).join("\n\n") : "");
  }, [chapter?.id]);

  if (!book || !chapter) return null;

  const update = (next: Book) => {
    setBooks(upsertBook(next));
  };

  const patchBook = (patch: Partial<Book>) => update({ ...book, ...patch });

  const patchChapter = (patch: Partial<typeof chapter>) =>
    update({
      ...book,
      chapters: book.chapters.map((item, index) =>
        index === chapterIndex ? { ...item, ...patch } : item,
      ),
    });

  const saveDraft = () => {
    patchChapter({ paragraphs: textToParagraphs(chapter.id, draft) });
    toast.success("تم حفظ الفصل");
  };

  /* ---------- أدوات التنسيق ---------- */
  const applyToSelection = (transform: (selected: string) => string) => {
    const area = areaRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = draft.slice(start, end);
    const replacement = transform(selected);
    const next = draft.slice(0, start) + replacement + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start, start + replacement.length);
    });
  };

  const tools = [
    {
      label: "تنصيص",
      icon: Quote,
      run: () => applyToSelection((text) => `«${text || "نص"}»`),
    },
    {
      label: "قائمة",
      icon: List,
      run: () =>
        applyToSelection((text) =>
          (text || "عنصر")
            .split("\n")
            .map((line) => (line.trim().startsWith("—") ? line : `— ${line.trim()}`))
            .join("\n"),
        ),
    },
    {
      label: "فقرة جديدة",
      icon: WrapText,
      run: () => applyToSelection((text) => `${text}\n\n`),
    },
    {
      label: "تنظيف المسافات",
      icon: Eraser,
      run: () =>
        setDraft((current) =>
          current
            .split(/\n\s*\n/)
            .map((block) => block.replace(/[ \t]+/g, " ").trim())
            .filter(Boolean)
            .join("\n\n"),
        ),
    },
  ];

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <main
      dir="rtl"
      className="paper-light min-h-screen bg-paper px-5 pt-6 pb-16"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between gap-3">
          <Link to="/" aria-label="رجوع" className="text-ink opacity-70">
            <ArrowRight className="size-6" />
          </Link>
          <h1 className="font-reading text-xl text-ink">لوحة الكتابة</h1>
          <Link
            to="/read/$bookId"
            params={{ bookId: book.id }}
            aria-label="معاينة في القارئ"
            className="text-ink opacity-70"
          >
            <BookOpen className="size-5" />
          </Link>
        </header>

        {/* اختيار الكتاب */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {books.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveId(item.id);
                setChapterIndex(0);
              }}
              className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                item.id === book.id
                  ? "border-ink bg-ink text-paper"
                  : "border-rule text-ink-soft hover:bg-rule/40"
              }`}
            >
              {item.title}
            </button>
          ))}
          <button
            onClick={() => {
              const created = createBook();
              setBooks(upsertBook(created));
              setActiveId(created.id);
              setChapterIndex(0);
            }}
            className="flex items-center gap-1 rounded-full border border-rule px-4 py-2 text-xs text-ink-soft hover:bg-rule/40"
          >
            <Plus className="size-3.5" /> كتاب جديد
          </button>
        </div>

        {/* بيانات الكتاب */}
        <section className="mt-6 space-y-3">
          <input
            value={book.title}
            onChange={(event) => patchBook({ title: event.target.value })}
            placeholder="عنوان الكتاب"
            className="w-full rounded-2xl border border-rule bg-transparent px-4 py-3 font-reading text-lg text-ink outline-none focus:border-ink/40"
          />
          <input
            value={book.author}
            onChange={(event) => patchBook({ author: event.target.value })}
            placeholder="المؤلف"
            className="w-full rounded-2xl border border-rule bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-ink/40"
          />
        </section>

        {/* الفصول */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">الفصول</h2>
            <button
              onClick={() => {
                const next = [...book.chapters, emptyChapter(book.id, book.chapters.length + 1)];
                update({ ...book, chapters: next });
                setChapterIndex(next.length - 1);
              }}
              className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink"
            >
              <Plus className="size-3.5" /> إضافة فصل
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {book.chapters.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setChapterIndex(index)}
                className={`rounded-xl px-3 py-2 text-xs transition-colors ${
                  index === chapterIndex ? "bg-rule text-ink" : "text-ink-soft hover:bg-rule/40"
                }`}
              >
                {index + 1}. {item.title}
              </button>
            ))}
          </div>
        </section>

        {/* المحرر */}
        <section className="mt-5 rounded-3xl border border-rule p-4">
          <input
            value={chapter.title}
            onChange={(event) => patchChapter({ title: event.target.value })}
            placeholder="عنوان الفصل"
            className="w-full bg-transparent pb-3 font-reading text-lg text-ink outline-none"
          />

          <div className="flex flex-wrap items-center gap-1.5 border-y border-rule py-2">
            {tools.map((tool) => (
              <button
                key={tool.label}
                onClick={tool.run}
                title={tool.label}
                aria-label={tool.label}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-ink-soft transition-colors hover:bg-rule/50 hover:text-ink"
              >
                <tool.icon className="size-3.5" />
                {tool.label}
              </button>
            ))}
          </div>

          <textarea
            ref={areaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="اكتب هنا… اترك سطراً فارغاً لبدء فقرة جديدة."
            className="mt-3 min-h-[45vh] w-full resize-y bg-transparent font-reading text-lg leading-9 text-ink outline-none"
          />

          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-ink-soft tabular-nums">{words} كلمة</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (book.chapters.length <= 1) {
                    toast.error("لا يمكن حذف الفصل الوحيد");
                    return;
                  }
                  update({
                    ...book,
                    chapters: book.chapters.filter((_, index) => index !== chapterIndex),
                  });
                  setChapterIndex(0);
                }}
                aria-label="حذف الفصل"
                className="rounded-full p-2 text-ink-soft hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                onClick={saveDraft}
                className="rounded-full bg-chrome px-6 py-2.5 text-sm font-medium text-chrome-ink"
              >
                حفظ الفصل
              </button>
            </div>
          </div>
        </section>

        <button
          onClick={() => {
            const next = deleteBook(book.id);
            setBooks(next.length ? next : seedBooks);
            setActiveId(next[0]?.id ?? "");
            setChapterIndex(0);
          }}
          className="mt-6 text-xs text-ink-soft hover:text-destructive"
        >
          حذف هذا الكتاب من المكتبة
        </button>
      </div>
    </main>
  );
}

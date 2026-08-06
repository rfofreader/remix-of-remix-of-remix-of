import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2, Type, Upload } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAuthors,
  fetchBooks,
  fetchCategories,
  removeAuthor,
  removeBook,
  removeCategory,
  saveAuthor,
  saveBook,
  saveCategory,
  uploadCover,
  type AuthorRow,
  type BookWithCategory,
  type CategoryRow,
} from "@/lib/books-api";
import { newVolume, toVolumes, type BookVolume } from "@/lib/book-content";
import { FormatToolbar, type FormatAction } from "@/components/studio/FormatToolbar";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "لوحة الكتابة — رفوفي" },
      { name: "description", content: "لوحة المشرف لإضافة الكتب والمؤلفين والتصنيفات وتحرير المحتوى." },
      { property: "og:title", content: "لوحة الكتابة — رفوفي" },
      { property: "og:description", content: "إدارة الكتب والمؤلفين والتصنيفات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioPage,
});

type Tab = "book" | "authors" | "categories";

interface Draft {
  id?: string;
  title: string;
  author: string;
  author_id: string;
  cover_url: string;
  download_url: string;
  publisher: string;
  published_date: string;
  page_count: string;
  price: string;
  description: string;
  category_id: string;
  volumes: BookVolume[];
}

const emptyDraft = (): Draft => ({
  title: "",
  author: "",
  author_id: "",
  cover_url: "",
  download_url: "",
  publisher: "",
  published_date: "",
  page_count: "",
  price: "0",
  description: "",
  category_id: "",
  volumes: [newVolume(1)],
});

function StudioPage() {
  const { loading, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("book");
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [activeVolume, setActiveVolume] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [authorDraft, setAuthorDraft] = useState({ name: "", bio: "", photo_url: "" });
  const [busy, setBusy] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const refresh = () => {
    void fetchBooks().then(setBooks);
    void fetchCategories().then(setCategories);
    void fetchAuthors().then(setAuthors);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    if (isAdmin) refresh();
  }, [loading, user, isAdmin, navigate]);

  const volume = draft.volumes[activeVolume] ?? draft.volumes[0];

  const patchVolume = (patch: Partial<BookVolume>) => {
    setDraft((current) => ({
      ...current,
      volumes: current.volumes.map((item, index) =>
        index === activeVolume ? { ...item, ...patch } : item,
      ),
    }));
  };

  /* إدراج تنسيق ماركداون في موضع المؤشر داخل المحرر */
  const applyFormat = (action: FormatAction) => {
    const el = editorRef.current;
    if (!el) return;
    const value = el.value;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    let next: string;
    let caret: number;
    if (action.line) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + action.prefix + value.slice(lineStart);
      caret = start + action.prefix.length;
    } else {
      const selected = value.slice(start, end);
      next =
        value.slice(0, start) +
        action.prefix +
        selected +
        (action.suffix ?? "") +
        value.slice(end);
      caret = start + action.prefix.length + selected.length;
    }

    patchVolume({ markdown: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const editBook = (book: BookWithCategory) => {
    const volumes = toVolumes(book.content);
    setTab("book");
    setDraft({
      id: book.id,
      title: book.title,
      author: book.author,
      author_id: book.author_id ?? "",
      cover_url: book.cover_url ?? "",
      download_url: book.download_url ?? "",
      publisher: book.publisher ?? "",
      published_date: book.published_date ?? "",
      page_count: book.page_count ? String(book.page_count) : "",
      price: String(book.price ?? 0),
      description: book.description ?? "",
      category_id: book.category_id ?? "",
      volumes: volumes.length ? volumes : [newVolume(1)],
    });
    setActiveVolume(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!draft.title.trim() || !draft.author.trim()) {
      toast.error("العنوان والمؤلف مطلوبان");
      return;
    }
    setBusy(true);
    try {
      await saveBook({
        ...(draft.id ? { id: draft.id } : {}),
        title: draft.title.trim(),
        author: draft.author.trim(),
        author_id: draft.author_id || null,
        cover_url: draft.cover_url.trim() || null,
        download_url: draft.download_url.trim() || null,
        publisher: draft.publisher.trim() || null,
        published_date: draft.published_date.trim() || null,
        page_count: draft.page_count ? Number(draft.page_count) : null,
        description: draft.description.trim() || null,
        price: Number(draft.price) || 0,
        category_id: draft.category_id || null,
        content: draft.volumes,
      });
      toast.success(draft.id ? "تم حفظ التعديلات" : "تمت إضافة الكتاب");
      setDraft(emptyDraft());
      setActiveVolume(0);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر الحفظ");
    } finally {
      setBusy(false);
    }
  };

  const stats = useMemo(
    () => ({
      words: draft.volumes.reduce(
        (sum, item) => sum + item.markdown.trim().split(/\s+/).filter(Boolean).length,
        0,
      ),
    }),
    [draft.volumes],
  );

  if (loading) {
    return <AppPage title="لوحة الكتابة">{null}</AppPage>;
  }

  if (!isAdmin) {
    return (
      <AppPage title="لوحة الكتابة" subtitle="هذه الصفحة للمشرفين فقط">
        <p className="mt-8 text-sm leading-7 text-ink-soft">
          حسابك الحالي لا يملك صلاحية المشرف.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm text-ink underline">
          العودة إلى الرئيسية
        </Link>
      </AppPage>
    );
  }

  const dock =
    tab === "book" ? (
      <>
        <button
          onClick={() => void submit()}
          disabled={busy}
          aria-label={draft.id ? "حفظ التعديلات" : "نشر الكتاب"}
          className="flex size-14 items-center justify-center rounded-3xl bg-brand text-brand-ink shadow-[0_14px_28px_-14px_rgb(0_0_0/0.7)] transition-transform active:scale-95 disabled:opacity-60"
        >
          <Save className="size-6" />
        </button>
        <button
          onClick={() => setFormatOpen((value) => !value)}
          aria-label="لوحة التنسيق"
          className="flex size-14 items-center justify-center rounded-3xl bg-panel text-panel-ink shadow-[0_14px_28px_-14px_rgb(0_0_0/0.7)] transition-transform active:scale-95"
        >
          <Type className="size-6" />
        </button>
      </>
    ) : null;

  return (
    <AppPage
      title="لوحة الكتابة"
      subtitle={`${books.length} كتاب • ${authors.length} مؤلف • ${stats.words} كلمة في المسودة`}
      navExtra={dock}
    >
      <div className="mt-5 flex gap-2">
        <TabButton active={tab === "book"} onClick={() => setTab("book")} label="كتاب جديد" />
        <TabButton active={tab === "authors"} onClick={() => setTab("authors")} label="المؤلفون" />
        <TabButton
          active={tab === "categories"}
          onClick={() => setTab("categories")}
          label="التصنيفات"
        />
      </div>

      {tab === "categories" ? (
        <section className="mt-5 rounded-lg bg-panel p-4">
          <h2 className="font-reading text-base text-ink">التصنيفات</h2>
          <div className="mt-3 flex gap-2">
            <Input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="اسم تصنيف جديد"
              className="h-10 rounded-lg border-rule bg-paper text-ink"
            />
            <button
              onClick={async () => {
                const name = categoryName.trim();
                if (!name) return;
                try {
                  await saveCategory({
                    name,
                    slug: name.replace(/\s+/g, "-"),
                    description: null,
                  });
                  setCategoryName("");
                  refresh();
                } catch {
                  toast.error("تعذّرت إضافة التصنيف");
                }
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-ink"
              aria-label="إضافة تصنيف"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-lg bg-paper px-3 py-1.5 text-xs text-ink"
              >
                {item.name}
                <button
                  onClick={async () => {
                    await removeCategory(item.id);
                    refresh();
                  }}
                  aria-label={`حذف ${item.name}`}
                  className="text-ink-soft"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "authors" ? (
        <section className="mt-5 rounded-lg bg-panel p-4">
          <h2 className="font-reading text-base text-ink">المؤلفون</h2>
          <Input
            value={authorDraft.name}
            onChange={(event) => setAuthorDraft((d) => ({ ...d, name: event.target.value }))}
            placeholder="اسم المؤلف"
            className="mt-3 h-10 rounded-lg border-rule bg-paper text-ink"
          />
          <Input
            value={authorDraft.photo_url}
            onChange={(event) => setAuthorDraft((d) => ({ ...d, photo_url: event.target.value }))}
            placeholder="رابط صورة المؤلف (اختياري)"
            className="mt-2 h-10 rounded-lg border-rule bg-paper text-ink"
          />
          <Textarea
            value={authorDraft.bio}
            onChange={(event) => setAuthorDraft((d) => ({ ...d, bio: event.target.value }))}
            placeholder="نبذة عن المؤلف"
            className="mt-2 min-h-20 rounded-lg border-rule bg-paper text-ink"
          />
          <button
            onClick={async () => {
              const name = authorDraft.name.trim();
              if (!name) return;
              try {
                await saveAuthor({
                  name,
                  bio: authorDraft.bio.trim() || null,
                  photo_url: authorDraft.photo_url.trim() || null,
                });
                setAuthorDraft({ name: "", bio: "", photo_url: "" });
                refresh();
                toast.success("تمت إضافة المؤلف");
              } catch {
                toast.error("تعذّرت إضافة المؤلف");
              }
            }}
            className="mt-3 w-full rounded-lg bg-brand py-3 text-sm font-medium text-brand-ink"
          >
            إضافة مؤلف
          </button>

          <ul className="mt-4 space-y-2">
            {authors.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg bg-paper px-3 py-2.5 text-sm text-ink"
              >
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <Link
                  to="/author/$authorId"
                  params={{ authorId: item.id }}
                  className="text-xs text-ink-soft underline"
                >
                  الصفحة
                </Link>
                <button
                  onClick={async () => {
                    await removeAuthor(item.id);
                    refresh();
                  }}
                  aria-label={`حذف ${item.name}`}
                  className="text-ink-soft"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "book" ? (
        <>
          <section className="mt-5 rounded-lg bg-panel p-4">
            <h2 className="font-reading text-base text-ink">
              {draft.id ? "تعديل كتاب" : "كتاب جديد"}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Field label="العنوان" value={draft.title} onChange={(title) => setDraft((d) => ({ ...d, title }))} full />
              <Field label="اسم المؤلف (نص)" value={draft.author} onChange={(author) => setDraft((d) => ({ ...d, author }))} />
              <label className="text-xs text-ink-soft">
                ربط المؤلف
                <select
                  value={draft.author_id}
                  onChange={(event) => {
                    const author_id = event.target.value;
                    const found = authors.find((item) => item.id === author_id);
                    setDraft((d) => ({
                      ...d,
                      author_id,
                      author: found ? found.name : d.author,
                    }));
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-rule bg-paper px-2 text-sm text-ink"
                >
                  <option value="">بدون</option>
                  {authors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="الناشر" value={draft.publisher} onChange={(publisher) => setDraft((d) => ({ ...d, publisher }))} />
              <Field label="تاريخ النشر" value={draft.published_date} onChange={(published_date) => setDraft((d) => ({ ...d, published_date }))} />
              <Field label="عدد الصفحات" value={draft.page_count} onChange={(page_count) => setDraft((d) => ({ ...d, page_count }))} />
              <Field label="السعر" value={draft.price} onChange={(price) => setDraft((d) => ({ ...d, price }))} />
              <label className="text-xs text-ink-soft">
                التصنيف
                <select
                  value={draft.category_id}
                  onChange={(event) => setDraft((d) => ({ ...d, category_id: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-rule bg-paper px-2 text-sm text-ink"
                >
                  <option value="">بدون</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="رابط التحميل"
                value={draft.download_url}
                onChange={(download_url) => setDraft((d) => ({ ...d, download_url }))}
                full
              />
            </div>

            <div className="mt-3">
              <p className="text-xs text-ink-soft">الغلاف</p>
              <div className="mt-1 flex gap-2">
                <Input
                  value={draft.cover_url}
                  onChange={(event) => setDraft((d) => ({ ...d, cover_url: event.target.value }))}
                  placeholder="رابط صورة الغلاف"
                  className="h-10 rounded-lg border-rule bg-paper text-ink"
                />
                <label
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand text-brand-ink"
                  aria-label="رفع غلاف"
                >
                  <Upload className="size-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadCover(file);
                        setDraft((d) => ({ ...d, cover_url: url }));
                        toast.success("تم رفع الغلاف");
                      } catch {
                        toast.error("تعذّر رفع الغلاف");
                      }
                    }}
                  />
                </label>
              </div>
              {draft.cover_url ? (
                <img
                  src={draft.cover_url}
                  alt="معاينة الغلاف"
                  className="mt-2 h-28 w-20 rounded-lg object-cover"
                />
              ) : null}
            </div>

            <label className="mt-3 block text-xs text-ink-soft">
              نبذة
              <Textarea
                value={draft.description}
                onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
                className="mt-1 min-h-20 rounded-lg border-rule bg-paper text-ink"
              />
            </label>
          </section>

          <section className="mt-5 rounded-lg bg-panel p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-reading text-base text-ink">المحتوى (ماركداون)</h2>
              <button
                onClick={() =>
                  setDraft((d) => {
                    const volumes = [...d.volumes, newVolume(d.volumes.length + 1)];
                    setActiveVolume(volumes.length - 1);
                    return { ...d, volumes };
                  })
                }
                className="flex items-center gap-1 rounded-lg bg-paper px-3 py-1.5 text-xs text-ink"
              >
                <Plus className="size-3.5" /> مجلد
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {draft.volumes.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveVolume(index)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    index === activeVolume ? "bg-brand text-brand-ink" : "bg-paper text-ink-soft"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {volume ? (
              <>
                <Input
                  value={volume.title}
                  onChange={(event) => patchVolume({ title: event.target.value })}
                  placeholder="اسم المجلد"
                  className="mt-3 h-10 rounded-lg border-rule bg-paper text-ink"
                />
                <Textarea
                  ref={editorRef}
                  value={volume.markdown}
                  onChange={(event) => patchVolume({ markdown: event.target.value })}
                  dir="rtl"
                  placeholder={"# عنوان رئيسي\n\n## عنوان فرعي\n\nنص الفقرة…"}
                  className="mt-2 min-h-64 rounded-lg border-rule bg-paper font-quran text-[15px] leading-8 text-ink"
                />
                <p className="pt-2 text-[11px] leading-5 text-ink-soft">
                  استخدم لوحة التنسيق العائمة لإضافة العناوين والقوائم والاقتباسات، أو اكتب
                  الماركداون مباشرة.
                </p>
                {draft.volumes.length > 1 ? (
                  <button
                    onClick={() =>
                      setDraft((d) => {
                        const volumes = d.volumes.filter((_item, index) => index !== activeVolume);
                        setActiveVolume(0);
                        return { ...d, volumes };
                      })
                    }
                    className="mt-2 text-xs text-ink-soft underline"
                  >
                    حذف هذا المجلد
                  </button>
                ) : null}
              </>
            ) : null}

            {draft.id ? (
              <button
                onClick={() => {
                  setDraft(emptyDraft());
                  setActiveVolume(0);
                }}
                className="mt-4 w-full rounded-lg bg-paper py-3 text-sm text-ink"
              >
                مسودة جديدة
              </button>
            ) : null}
          </section>

          <section className="mt-5">
            <h2 className="font-reading text-base text-ink">الكتب المنشورة</h2>
            <ul className="mt-3 space-y-2">
              {books.map((book) => (
                <li
                  key={book.id}
                  className="flex items-center gap-3 rounded-lg bg-panel px-3 py-3 text-sm text-ink"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{book.title}</span>
                    <span className="block text-[11px] text-ink-soft">{book.author}</span>
                  </span>
                  <button onClick={() => editBook(book)} className="text-xs text-ink-soft underline">
                    تحرير
                  </button>
                  <button
                    onClick={async () => {
                      await removeBook(book.id);
                      refresh();
                    }}
                    aria-label="حذف"
                    className="text-ink-soft"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {formatOpen && tab === "book" ? (
        <FormatToolbar onApply={applyFormat} onClose={() => setFormatOpen(false)} />
      ) : null}
    </AppPage>
  );
}

function TabButton({
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
      className={`flex-1 rounded-lg px-3 py-2 text-xs transition-colors ${
        active ? "bg-brand text-brand-ink" : "bg-panel text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`text-xs text-ink-soft ${full ? "col-span-2" : ""}`}>
      {label}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 rounded-lg border-rule bg-paper text-ink"
      />
    </label>
  );
}

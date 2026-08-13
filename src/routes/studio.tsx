import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { DashboardShell, Field, FieldGroup, type DashTab } from "@/components/studio/DashboardShell";
import { ManuscriptEditor } from "@/components/studio/ManuscriptEditor";
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
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown-html";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "لوحة النشر — رفوف" },
      { name: "description", content: "لوحة المشرف لإدارة الكتب والمؤلفين والتصنيفات وتحرير المخطوطات." },
      { property: "og:title", content: "لوحة النشر — رفوف" },
      { property: "og:description", content: "إدارة الكتب والمؤلفين والتصنيفات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioPage,
});

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
  const [tab, setTab] = useState<DashTab>("overview");
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [activeVolume, setActiveVolume] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [authorDraft, setAuthorDraft] = useState({ name: "", bio: "", photo_url: "" });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isAdmin]);

  const volume = draft.volumes[activeVolume] ?? draft.volumes[0]!;
  const editorHtml = useMemo(() => markdownToHtml(volume.markdown), [volume.id, activeVolume]);

  const patchVolume = (patch: Partial<BookVolume>) => {
    setDraft((current) => ({
      ...current,
      volumes: current.volumes.map((item, index) =>
        index === activeVolume ? { ...item, ...patch } : item,
      ),
    }));
  };

  const editBook = (book: BookWithCategory) => {
    const volumes = toVolumes(book.content);
    setTab("books");
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
      toast.success(draft.id ? "تم حفظ التعديلات" : "تم نشر الكتاب");
      setDraft(emptyDraft());
      setActiveVolume(0);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر الحفظ");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-dvh bg-dash-bg p-6 text-dash-fg">
        <h1 className="text-lg font-semibold">لوحة النشر</h1>
        <p className="mt-3 text-sm text-dash-muted">حسابك الحالي لا يملك صلاحية المشرف.</p>
        <Link to="/" className="mt-4 inline-block text-sm underline">
          العودة إلى الرئيسية
        </Link>
      </div>
    );
  }

  const words = draft.volumes.reduce(
    (sum, item) => sum + item.markdown.trim().split(/\s+/).filter(Boolean).length,
    0,
  );

  return (
    <DashboardShell
      tab={tab}
      onTab={setTab}
      title={
        tab === "overview"
          ? "نظرة عامة"
          : tab === "books"
            ? draft.id
              ? "تحرير كتاب"
              : "كتاب جديد"
            : tab === "authors"
              ? "المؤلفون"
              : "التصنيفات"
      }
      subtitle={`${books.length} كتاب · ${authors.length} مؤلف · ${categories.length} تصنيف`}
      actions={
        tab === "books" ? (
          <button
            onClick={() => void submit()}
            disabled={busy}
            className="flex min-h-10 items-center gap-1.5 rounded-md bg-dash-fg px-3 text-[0.8125rem] text-dash-surface disabled:opacity-60"
          >
            <Save className="size-4" strokeWidth={1.6} />
            {draft.id ? "حفظ" : "نشر"}
          </button>
        ) : null
      }
    >
      {tab === "overview" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="الكتب" value={books.length} />
          <Stat label="المؤلفون" value={authors.length} />
          <Stat label="التصنيفات" value={categories.length} />
          <section className="rounded-lg border border-dash-border bg-dash-surface p-4 sm:col-span-3">
            <h2 className="mb-3 text-sm font-semibold">أحدث الكتب</h2>
            <ul className="divide-y divide-dash-border">
              {books.slice(0, 8).map((book) => (
                <li key={book.id}>
                  <button
                    onClick={() => editBook(book)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-start"
                  >
                    <span className="min-w-0 truncate text-sm">{book.title}</span>
                    <span className="shrink-0 text-[0.75rem] text-dash-muted">{book.author}</span>
                  </button>
                </li>
              ))}
              {books.length === 0 ? <li className="py-6 text-center text-sm text-dash-muted">لا كتب بعد.</li> : null}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "books" ? (
        <div className="grid gap-3">
          <FieldGroup title="بيانات الكتاب">
            <Field label="العنوان" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            <Field label="المؤلف" value={draft.author} onChange={(v) => setDraft({ ...draft, author: v })} />
            <Field label="الناشر" value={draft.publisher} onChange={(v) => setDraft({ ...draft, publisher: v })} />
            <Field label="سنة النشر" value={draft.published_date} onChange={(v) => setDraft({ ...draft, published_date: v })} />
            <Field label="عدد الصفحات" value={draft.page_count} onChange={(v) => setDraft({ ...draft, page_count: v })} />
            <Field label="السعر" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
            <Field label="رابط التحميل" value={draft.download_url} onChange={(v) => setDraft({ ...draft, download_url: v })} placeholder="https://…" />
            <Field label="رابط الغلاف" value={draft.cover_url} onChange={(v) => setDraft({ ...draft, cover_url: v })} placeholder="https://…" />
            <Field label="نبذة" full textarea value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />

            <label className="block">
              <span className="mb-1 block text-[0.75rem] text-dash-muted">التصنيف</span>
              <select
                value={draft.category_id}
                onChange={(event) => setDraft({ ...draft, category_id: event.target.value })}
                className="w-full rounded-md border border-dash-border bg-dash-bg px-3 py-2.5 text-sm outline-none"
              >
                <option value="">بدون تصنيف</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[0.75rem] text-dash-muted">المؤلف المرتبط</span>
              <select
                value={draft.author_id}
                onChange={(event) => setDraft({ ...draft, author_id: event.target.value })}
                className="w-full rounded-md border border-dash-border bg-dash-bg px-3 py-2.5 text-sm outline-none"
              >
                <option value="">بدون ربط</option>
                {authors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadCover(file);
                    setDraft((current) => ({ ...current, cover_url: url }));
                    toast.success("تم رفع الغلاف");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "تعذّر الرفع");
                  }
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex min-h-10 items-center gap-1.5 rounded-md border border-dash-border px-3 text-[0.8125rem]"
              >
                <Upload className="size-4" strokeWidth={1.6} />
                رفع غلاف
              </button>
              {draft.cover_url ? (
                <img src={draft.cover_url} alt="معاينة الغلاف" className="h-16 w-12 rounded-md object-cover" />
              ) : null}
            </div>
          </FieldGroup>

          <section className="rounded-lg border border-dash-border bg-dash-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">المخطوطة</h2>
              <button
                onClick={() => {
                  setDraft((current) => ({
                    ...current,
                    volumes: [...current.volumes, newVolume(current.volumes.length + 1)],
                  }));
                  setActiveVolume(draft.volumes.length);
                }}
                className="flex min-h-9 items-center gap-1 rounded-md border border-dash-border px-2.5 text-[0.75rem]"
              >
                <Plus className="size-3.5" />
                جزء جديد
              </button>
            </div>
            <div className="mb-3 flex gap-1 overflow-x-auto">
              {draft.volumes.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveVolume(index)}
                  className={`min-h-9 shrink-0 rounded-md px-3 text-[0.75rem] ${
                    index === activeVolume ? "bg-dash-fg/10 font-medium" : "text-dash-muted"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <Field label="عنوان الجزء" value={volume.title} onChange={(v) => patchVolume({ title: v })} />
            <div className="mt-3">
              <ManuscriptEditor
                key={`${draft.id ?? "new"}-${volume.id}`}
                content={editorHtml}
                onUpdate={(html) => patchVolume({ markdown: htmlToMarkdown(html) })}
              />
            </div>
            <p className="mt-2 text-[0.7rem] text-dash-muted">{words} كلمة في المسودة</p>
          </section>

          <section className="rounded-lg border border-dash-border bg-dash-surface p-4">
            <h2 className="mb-3 text-sm font-semibold">الكتب المنشورة</h2>
            <ul className="divide-y divide-dash-border">
              {books.map((book) => (
                <li key={book.id} className="flex items-center justify-between gap-3 py-2.5">
                  <button onClick={() => editBook(book)} className="min-w-0 flex-1 truncate text-start text-sm">
                    {book.title}
                  </button>
                  <button
                    aria-label={`حذف ${book.title}`}
                    onClick={async () => {
                      await removeBook(book.id);
                      toast.success("تم الحذف");
                      refresh();
                    }}
                    className="grid size-9 place-items-center rounded-md border border-dash-border text-dash-muted"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "authors" ? (
        <div className="grid gap-3">
          <FieldGroup title="مؤلف جديد">
            <Field label="الاسم" value={authorDraft.name} onChange={(v) => setAuthorDraft({ ...authorDraft, name: v })} />
            <Field label="رابط الصورة" value={authorDraft.photo_url} onChange={(v) => setAuthorDraft({ ...authorDraft, photo_url: v })} />
            <Field label="نبذة" full textarea value={authorDraft.bio} onChange={(v) => setAuthorDraft({ ...authorDraft, bio: v })} />
            <div className="sm:col-span-2">
              <button
                onClick={async () => {
                  if (!authorDraft.name.trim()) return;
                  await saveAuthor({
                    name: authorDraft.name.trim(),
                    bio: authorDraft.bio.trim() || null,
                    photo_url: authorDraft.photo_url.trim() || null,
                  });
                  setAuthorDraft({ name: "", bio: "", photo_url: "" });
                  toast.success("تمت الإضافة");
                  refresh();
                }}
                className="min-h-10 rounded-md bg-dash-fg px-3 text-[0.8125rem] text-dash-surface"
              >
                إضافة مؤلف
              </button>
            </div>
          </FieldGroup>

          <section className="rounded-lg border border-dash-border bg-dash-surface p-4">
            <ul className="divide-y divide-dash-border">
              {authors.map((author) => (
                <li key={author.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate">{author.name}</span>
                  <button
                    aria-label={`حذف ${author.name}`}
                    onClick={async () => {
                      await removeAuthor(author.id);
                      refresh();
                    }}
                    className="grid size-9 place-items-center rounded-md border border-dash-border text-dash-muted"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "categories" ? (
        <section className="rounded-lg border border-dash-border bg-dash-surface p-4">
          <div className="flex gap-2">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="اسم تصنيف جديد"
              className="min-h-10 flex-1 rounded-md border border-dash-border bg-dash-bg px-3 text-sm outline-none"
            />
            <button
              onClick={async () => {
                const name = categoryName.trim();
                if (!name) return;
                await saveCategory({
                  name,
                  slug: name.replace(/\s+/g, "-"),
                  description: null,
                });
                setCategoryName("");
                refresh();
              }}
              className="min-h-10 rounded-md bg-dash-fg px-3 text-[0.8125rem] text-dash-surface"
            >
              إضافة
            </button>
          </div>
          <ul className="mt-3 divide-y divide-dash-border">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate">{category.name}</span>
                <button
                  aria-label={`حذف ${category.name}`}
                  onClick={async () => {
                    await removeCategory(category.id);
                    refresh();
                  }}
                  className="grid size-9 place-items-center rounded-md border border-dash-border text-dash-muted"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-dash-border bg-dash-surface p-4">
      <p className="text-[0.75rem] text-dash-muted">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

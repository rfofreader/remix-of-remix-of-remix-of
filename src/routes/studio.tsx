import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { AppPage } from "@/components/layout/AppPage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchBooks,
  fetchCategories,
  removeBook,
  removeCategory,
  saveBook,
  saveCategory,
  type BookWithCategory,
  type CategoryRow,
} from "@/lib/books-api";
import { newVolume, toVolumes, type BookVolume } from "@/lib/book-content";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "لوحة الكتابة — أثر الهدوء" },
      { name: "description", content: "لوحة المشرف لإضافة الكتب والتصنيفات وتحرير محتواها." },
      { property: "og:title", content: "لوحة الكتابة — أثر الهدوء" },
      { property: "og:description", content: "إدارة الكتب والتصنيفات." },
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
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [activeVolume, setActiveVolume] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    void fetchBooks().then(setBooks);
    void fetchCategories().then(setCategories);
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

  const editBook = (book: BookWithCategory) => {
    const volumes = toVolumes(book.content);
    setDraft({
      id: book.id,
      title: book.title,
      author: book.author,
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

  return (
    <AppPage title="لوحة الكتابة" subtitle={`${books.length} كتاب • ${stats.words} كلمة في المسودة`}>
      {/* التصنيفات */}
      <section className="mt-6 rounded-lg bg-panel p-4">
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

      {/* بيانات الكتاب */}
      <section className="mt-5 rounded-lg bg-panel p-4">
        <h2 className="font-reading text-base text-ink">
          {draft.id ? "تعديل كتاب" : "كتاب جديد"}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="العنوان" value={draft.title} onChange={(title) => setDraft((d) => ({ ...d, title }))} full />
          <Field label="المؤلف" value={draft.author} onChange={(author) => setDraft((d) => ({ ...d, author }))} />
          <Field label="الناشر" value={draft.publisher} onChange={(publisher) => setDraft((d) => ({ ...d, publisher }))} />
          <Field label="تاريخ النشر" value={draft.published_date} onChange={(published_date) => setDraft((d) => ({ ...d, published_date }))} />
          <Field label="عدد الصفحات" value={draft.page_count} onChange={(page_count) => setDraft((d) => ({ ...d, page_count }))} />
          <Field label="السعر" value={draft.price} onChange={(price) => setDraft((d) => ({ ...d, price }))} />
          <label className="col-span-1 text-xs text-ink-soft">
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

      {/* المجلدات والمحتوى */}
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
              value={volume.markdown}
              onChange={(event) => patchVolume({ markdown: event.target.value })}
              dir="rtl"
              placeholder={"# عنوان رئيسي\n\n## عنوان فرعي\n\nنص الفقرة…"}
              className="mt-2 min-h-64 rounded-lg border-rule bg-paper font-quran text-[15px] leading-8 text-ink"
            />
            <p className="pt-2 text-[11px] leading-5 text-ink-soft">
              استخدم # للعنوان الرئيسي، ## للفرعي، ### للفرعي الصغير. الأسطر الفارغة تفصل الفقرات،
              ويُبنى الفهرس تلقائياً من العناوين.
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

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => void submit()}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-medium text-brand-ink disabled:opacity-60"
          >
            <Save className="size-4" />
            {draft.id ? "حفظ التعديلات" : "نشر الكتاب"}
          </button>
          {draft.id ? (
            <button
              onClick={() => {
                setDraft(emptyDraft());
                setActiveVolume(0);
              }}
              className="rounded-lg bg-paper px-4 text-sm text-ink"
            >
              جديد
            </button>
          ) : null}
        </div>
      </section>

      {/* قائمة الكتب */}
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
    </AppPage>
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

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BookMarked, Heart, LogOut, PenLine, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/layout/AppPage";
import { BookCover } from "@/components/library/BookCover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchFavorites, fetchHistory, type BookWithCategory } from "@/lib/books-api";
import {
  createReadingList,
  ensureDefaultLists,
  fetchReadingLists,
  removeReadingList,
  type ReadingList,
} from "@/lib/reading-lists";
import { loadHighlights } from "@/lib/reader-storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "ملفي — رفوف" },
      { name: "description", content: "ملفك الشخصي وإحصاءات قراءتك وقوائم القراءة." },
      { property: "og:title", content: "ملفي — رفوف" },
      { property: "og:description", content: "ملفك الشخصي وقوائم قراءتك." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

interface Profile {
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

function AccountPage() {
  const { loading, user, isAdmin, displayName } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<BookWithCategory[]>([]);
  const [history, setHistory] = useState<
    { book: BookWithCategory; ratio: number }[]
  >([]);
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ display_name: "", username: "", bio: "" });
  const [newListOpen, setNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const reloadLists = async (userId: string) => {
    await ensureDefaultLists(userId);
    setLists(await fetchReadingLists(userId));
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    void supabase
      .from("profiles")
      .select("display_name, username, bio, avatar_url, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile((data as Profile) ?? null));
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
    void reloadLists(user.id);
  }, [loading, user, navigate]);

  /* ---------- إحصاءات ---------- */
  const stats = useMemo(() => {
    const finished = history.filter((item) => item.ratio >= 0.97).length;
    const minutes = history.reduce(
      (total, item) => total + item.ratio * (item.book.page_count ?? 180) * 1.6,
      0,
    );
    const marks = history.reduce(
      (total, item) => total + loadHighlights(item.book.id).length,
      0,
    );
    return {
      owned: favorites.length,
      finished,
      hours: Math.round(minutes / 60),
      reviews: 0,
      marks,
    };
  }, [history, favorites]);

  const joined = profile?.created_at
    ? new Intl.DateTimeFormat("ar", { year: "numeric", month: "long" }).format(
        new Date(profile.created_at),
      )
    : "";

  const openEdit = () => {
    setDraft({
      display_name: profile?.display_name ?? displayName,
      username: profile?.username ?? "",
      bio: profile?.bio ?? "",
    });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    const payload = {
      display_name: draft.display_name.trim() || null,
      username: draft.username.trim().replace(/^@/, "") || null,
      bio: draft.bio.trim() || null,
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    if (error) {
      toast.error("تعذّر الحفظ");
      return;
    }
    setProfile((current) => ({ ...(current as Profile), ...payload }));
    setEditOpen(false);
    toast.success("تم تحديث الملف الشخصي");
  };

  const addList = async () => {
    if (!user) return;
    const name = newListName.trim();
    if (!name) return;
    try {
      await createReadingList(user.id, name);
      setNewListName("");
      setNewListOpen(false);
      await reloadLists(user.id);
      toast.success("تمت إضافة القائمة");
    } catch {
      toast.error("تعذّر إنشاء القائمة");
    }
  };

  const deleteList = async (id: string) => {
    if (!user) return;
    await removeReadingList(id);
    await reloadLists(user.id);
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  if (!user) return <AppPage title="ملفي">{null}</AppPage>;

  const name = profile?.display_name || displayName || user.email || "";
  const initial = name.trim().charAt(0) || "؟";

  return (
    <AppPage
      header={
        <section className="rounded-lg bg-panel p-5 shadow-[0_18px_40px_-26px_rgb(0_0_0/0.35)]">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-brand font-reading text-2xl text-brand-ink">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="truncate font-reading text-2xl text-panel-ink">{name}</h1>
              {profile?.username ? (
                <p className="truncate text-xs text-panel-ink/55">@{profile.username}</p>
              ) : null}
              {profile?.bio ? (
                <p className="pt-2 text-sm leading-6 text-panel-ink/80">{profile.bio}</p>
              ) : null}
              {joined ? (
                <p className="pt-2 text-[11px] text-panel-ink/50">انضمّ في {joined}</p>
              ) : null}
            </div>
          </div>
          <button
            onClick={openEdit}
            className="mt-4 w-full rounded-lg bg-panel-rule py-3 text-sm font-medium text-panel-ink"
          >
            تعديل الملف الشخصي
          </button>
        </section>
      }
    >
      <ul className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon="📚" value={stats.owned} label="كتبي" />
        <Stat icon="📖" value={stats.finished} label="مقروءة" />
        <Stat icon="⏱" value={stats.hours} label="ساعة قراءة" />
        <Stat icon="⭐" value={stats.reviews} label="مراجعات" />
        <Stat icon="🖍" value={stats.marks} label="تظليل وملاحظة" />
        <Stat icon="🗂" value={lists.length} label="قوائم" />
      </ul>

      <div className="mt-6 space-y-2">
        {isAdmin ? (
          <Link
            to="/studio"
            className="flex items-center gap-2 rounded-lg bg-panel px-4 py-3.5 text-sm text-panel-ink"
          >
            <PenLine className="size-4 text-ink-soft" />
            لوحة الكتابة
          </Link>
        ) : null}
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-lg bg-panel px-4 py-3.5 text-sm text-panel-ink"
        >
          <LogOut className="size-4 text-ink-soft" />
          تسجيل الخروج
        </button>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between pb-3">
          <h2 className="flex items-center gap-2 font-reading text-lg text-ink">
            <BookMarked className="size-4 text-ink-soft" />
            قوائم القراءة
          </h2>
          <button
            onClick={() => setNewListOpen(true)}
            className="flex items-center gap-1 rounded-lg bg-panel px-3 py-1.5 text-xs text-panel-ink"
          >
            <Plus className="size-3.5" />
            قائمة جديدة
          </button>
        </div>
        <ul className="space-y-2">
          {lists.map((list) => (
            <li key={list.id} className="rounded-lg bg-panel px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm text-ink">{list.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-soft tabular-nums">
                    {list.books.length}
                  </span>
                  {!list.is_default ? (
                    <button
                      onClick={() => void deleteList(list.id)}
                      aria-label="حذف القائمة"
                      className="text-ink-soft"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </span>
              </div>
              {list.books.length ? (
                <ul className="mt-3 flex gap-2 overflow-x-auto">
                  {list.books.map((book) => (
                    <li key={book.id} className="w-16 shrink-0">
                      <Link to="/book/$bookId" params={{ bookId: book.id }}>
                        <BookCover book={book} className="aspect-[2/3] w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          dir="rtl"
          className="rounded-lg border border-panel-rule bg-panel text-panel-ink sm:max-w-md"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-panel-ink">تعديل الملف الشخصي</DialogTitle>
          </DialogHeader>
          <Input
            value={draft.display_name}
            onChange={(event) => setDraft({ ...draft, display_name: event.target.value })}
            placeholder="الاسم"
            className="border-panel-rule bg-panel-rule"
          />
          <Input
            value={draft.username}
            onChange={(event) => setDraft({ ...draft, username: event.target.value })}
            placeholder="اسم المستخدم"
            className="border-panel-rule bg-panel-rule"
          />
          <Textarea
            value={draft.bio}
            onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
            placeholder="نبذة قصيرة (اختياري)"
            className="min-h-24 border-panel-rule bg-panel-rule"
          />
          <button
            onClick={() => void saveProfile()}
            className="rounded-lg bg-panel-ink py-3 text-sm font-medium text-panel"
          >
            حفظ
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
        <DialogContent
          dir="rtl"
          className="rounded-lg border border-panel-rule bg-panel text-panel-ink sm:max-w-sm"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-panel-ink">قائمة قراءة جديدة</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            placeholder="اسم القائمة"
            className="border-panel-rule bg-panel-rule"
          />
          <button
            onClick={() => void addList()}
            className="rounded-lg bg-panel-ink py-3 text-sm font-medium text-panel"
          >
            إنشاء
          </button>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <li className="rounded-lg bg-panel px-3 py-3 text-center">
      <span className="block text-base leading-none">{icon}</span>
      <span className="block pt-1.5 text-lg font-semibold text-ink tabular-nums">{value}</span>
      <span className="block text-[11px] text-ink-soft">{label}</span>
    </li>
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

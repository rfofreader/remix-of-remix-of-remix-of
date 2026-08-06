import { supabase } from "@/integrations/supabase/client";
import type { BookWithCategory } from "@/lib/books-api";

export interface ReadingList {
  id: string;
  name: string;
  slug: string | null;
  is_default: boolean;
  sort_order: number;
  books: BookWithCategory[];
}

const DEFAULT_LISTS = [
  { slug: "want-to-read", name: "أريد قراءته" },
  { slug: "this-month", name: "هذا الشهر" },
  { slug: "philosophy", name: "الفلسفة" },
  { slug: "history", name: "التاريخ" },
  { slug: "literature", name: "الأدب" },
];

/** ينشئ قوائم القراءة الافتراضية للمستخدم عند أول زيارة. */
export async function ensureDefaultLists(userId: string) {
  const { data } = await supabase
    .from("reading_lists")
    .select("slug")
    .eq("user_id", userId)
    .eq("is_default", true);
  const existing = new Set((data ?? []).map((row) => row.slug));
  const missing = DEFAULT_LISTS.filter((list) => !existing.has(list.slug));
  if (missing.length === 0) return;
  await supabase.from("reading_lists").insert(
    missing.map((list, index) => ({
      user_id: userId,
      name: list.name,
      slug: list.slug,
      is_default: true,
      sort_order: DEFAULT_LISTS.findIndex((item) => item.slug === list.slug) + index * 0,
    })),
  );
}

export async function fetchReadingLists(userId: string): Promise<ReadingList[]> {
  const [{ data: lists }, { data: items }] = await Promise.all([
    supabase
      .from("reading_lists")
      .select("id, name, slug, is_default, sort_order")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("reading_list_items")
      .select("list_id, books(*, categories(id, name, slug))")
      .eq("user_id", userId),
  ]);

  const grouped = new Map<string, BookWithCategory[]>();
  for (const item of (items ?? []) as unknown as {
    list_id: string;
    books: BookWithCategory | null;
  }[]) {
    if (!item.books) continue;
    const current = grouped.get(item.list_id) ?? [];
    current.push(item.books);
    grouped.set(item.list_id, current);
  }

  return (lists ?? []).map((list) => ({ ...list, books: grouped.get(list.id) ?? [] }));
}

export async function createReadingList(userId: string, name: string) {
  const { error } = await supabase
    .from("reading_lists")
    .insert({ user_id: userId, name, is_default: false, sort_order: 100 });
  if (error) throw error;
}

export async function removeReadingList(id: string) {
  const { error } = await supabase.from("reading_lists").delete().eq("id", id);
  if (error) throw error;
}

export async function addBookToList(userId: string, listId: string, bookId: string) {
  const { error } = await supabase
    .from("reading_list_items")
    .insert({ user_id: userId, list_id: listId, book_id: bookId });
  if (error) throw error;
}

export async function removeBookFromList(listId: string, bookId: string) {
  const { error } = await supabase
    .from("reading_list_items")
    .delete()
    .eq("list_id", listId)
    .eq("book_id", bookId);
  if (error) throw error;
}

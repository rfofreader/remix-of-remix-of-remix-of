import { supabase } from "@/integrations/supabase/client";
import type { BookRow, BookVolume } from "@/lib/book-content";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface BookWithCategory extends BookRow {
  categories: { id: string; name: string; slug: string } | null;
}

const SELECT = "*, categories(id, name, slug)";

export async function fetchBooks(limit?: number): Promise<BookWithCategory[]> {
  let query = supabase
    .from("books")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as BookWithCategory[];
}

export async function fetchBook(id: string): Promise<BookWithCategory | null> {
  const { data, error } = await supabase.from("books").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as BookWithCategory | null;
}

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CategoryRow[];
}

export interface BookInput {
  id?: string;
  title: string;
  author: string;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  description: string | null;
  price: number;
  category_id: string | null;
  content: BookVolume[];
}

export async function saveBook(input: BookInput) {
  const payload = { ...input, content: input.content as unknown as never };
  if (input.id) {
    const { error } = await supabase.from("books").update(payload).eq("id", input.id);
    if (error) throw error;
    return input.id;
  }
  const { data, error } = await supabase.from("books").insert(payload).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function removeBook(id: string) {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
}

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
}) {
  if (input.id) {
    const { error } = await supabase.from("categories").update(input).eq("id", input.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("categories").insert(input);
  if (error) throw error;
}

export async function removeCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- المفضلة ---------- */

export async function fetchFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("book_id, books(*, categories(id, name, slug))")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as unknown as { book_id: string; books: BookWithCategory | null }[];
}

export async function toggleFavorite(userId: string, bookId: string, on: boolean) {
  if (on) {
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: userId, book_id: bookId }, { onConflict: "user_id,book_id" });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);
    if (error) throw error;
  }
}

/* ---------- سجل القراءة ---------- */

export async function fetchHistory(userId: string) {
  const { data, error } = await supabase
    .from("reading_history")
    .select("book_id, ratio, updated_at, books(*, categories(id, name, slug))")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as {
    book_id: string;
    ratio: number;
    updated_at: string;
    books: BookWithCategory | null;
  }[];
}

export async function saveHistory(userId: string, bookId: string, ratio: number) {
  await supabase.from("reading_history").upsert(
    { user_id: userId, book_id: bookId, ratio, updated_at: new Date().toISOString() },
    { onConflict: "user_id,book_id" },
  );
}

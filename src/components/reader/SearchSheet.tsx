import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import type { Book } from "@/data/sample-book";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  onSelect: (paragraphId: string) => void;
}

interface Result {
  paragraphId: string;
  chapterTitle: string;
  before: string;
  match: string;
  after: string;
}

export function SearchSheet({ open, onOpenChange, book, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const found: Result[] = [];
    for (const chapter of book.chapters) {
      for (const paragraph of chapter.paragraphs) {
        const index = paragraph.text.indexOf(q);
        if (index === -1) continue;
        found.push({
          paragraphId: paragraph.id,
          chapterTitle: chapter.title,
          before: paragraph.text.slice(Math.max(0, index - 40), index),
          match: paragraph.text.slice(index, index + q.length),
          after: paragraph.text.slice(index + q.length, index + q.length + 60),
        });
      }
    }
    return found;
  }, [query, book]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir="rtl"
        className="max-h-[82vh] rounded-t-3xl border-rule bg-panel text-panel-ink font-ui"
      >
        <SheetHeader className="text-right">
          <SheetTitle className="font-ui text-panel-ink">البحث في الكتاب</SheetTitle>
        </SheetHeader>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-soft" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="اكتب كلمة أو عبارة…"
            className="border-rule bg-paper pr-9 text-ink placeholder:text-ink-soft"
          />
        </div>
        <div className="mt-3 overflow-y-auto pb-8">
          {query.trim().length >= 2 && results.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">لا توجد نتائج</p>
          ) : null}
          {results.length > 0 ? (
            <p className="pb-2 text-xs text-ink-soft">{results.length} نتيجة</p>
          ) : null}
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={`${result.paragraphId}-${index}`}>
                <button
                  onClick={() => onSelect(result.paragraphId)}
                  className="w-full rounded-xl border border-rule px-3 py-3 text-right transition-colors hover:bg-rule/40"
                >
                  <span className="block text-xs text-ink-soft">{result.chapterTitle}</span>
                  <span className="mt-1 block text-sm leading-7">
                    …{result.before}
                    <mark className="bg-hl-yellow text-inherit">{result.match}</mark>
                    {result.after}…
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}

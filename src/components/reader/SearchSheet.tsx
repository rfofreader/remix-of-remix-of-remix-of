import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PopupPanel } from "@/components/reader/PopupPanel";
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
    <PopupPanel open={open} onOpenChange={onOpenChange} title="البحث في الكتاب">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-panel-ink/50" />
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="اكتب كلمة أو عبارة…"
          className="h-11 rounded-2xl border-panel-rule bg-panel-rule/60 pr-9 text-panel-ink placeholder:text-panel-ink/45"
        />
      </div>
      <div className="mt-3">
        {query.trim().length >= 2 && results.length === 0 ? (
          <p className="py-8 text-center text-sm text-panel-ink/55">لا توجد نتائج</p>
        ) : null}
        {results.length > 0 ? (
          <p className="pb-2 text-xs text-panel-ink/55">{results.length} نتيجة</p>
        ) : null}
        <ul className="space-y-2">
          {results.map((result, index) => (
            <li key={`${result.paragraphId}-${index}`}>
              <button
                onClick={() => onSelect(result.paragraphId)}
                className="w-full rounded-2xl border border-panel-rule px-3 py-3 text-right transition-colors hover:bg-panel-rule"
              >
                <span className="block text-xs text-panel-ink/55">{result.chapterTitle}</span>
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
    </PopupPanel>
  );
}

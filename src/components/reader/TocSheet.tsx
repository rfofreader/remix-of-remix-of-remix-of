import { PopupPanel } from "@/components/reader/PopupPanel";
import type { Book } from "@/data/sample-book";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
}

export function TocSheet({ open, onOpenChange, book, activeChapterId, onSelect }: Props) {
  return (
    <PopupPanel
      open={open}
      onOpenChange={onOpenChange}
      title="المحتويات"
      subtitle={`${book.title} — ${book.author}`}
    >
      <ul className="space-y-1">
        {book.chapters.map((chapter, index) => {
          const active = chapter.id === activeChapterId;
          return (
            <li key={chapter.id}>
              <button
                onClick={() => onSelect(chapter.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right transition-colors ${
                  active ? "bg-panel-rule font-semibold" : "hover:bg-panel-rule"
                }`}
              >
                <span className="w-5 shrink-0 text-xs text-panel-ink/45 tabular-nums">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm leading-6">{chapter.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </PopupPanel>
  );
}

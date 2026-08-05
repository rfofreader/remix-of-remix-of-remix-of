import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir="rtl"
        className="max-h-[78vh] rounded-t-3xl border-rule bg-panel text-panel-ink font-ui"
      >
        <SheetHeader className="text-right">
          <SheetTitle className="font-ui text-panel-ink">المحتويات</SheetTitle>
        </SheetHeader>
        <div className="mt-2 overflow-y-auto pb-8">
          <p className="px-1 pb-4 text-sm text-ink-soft">
            {book.title} — {book.author}
          </p>
          <ul className="space-y-1">
            {book.chapters.map((chapter, index) => {
              const active = chapter.id === activeChapterId;
              return (
                <li key={chapter.id}>
                  <button
                    onClick={() => onSelect(chapter.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors hover:bg-rule/40 ${
                      active ? "bg-rule/60 font-semibold" : ""
                    }`}
                  >
                    <span className="w-6 shrink-0 text-sm text-ink-soft">{index + 1}</span>
                    <span className="flex-1">{chapter.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}

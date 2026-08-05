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
        hideClose
        overlayClassName="bg-transparent"
        className="max-h-[70vh] overflow-y-auto inset-x-3 bottom-32 rounded-3xl border border-panel-rule bg-panel/75 backdrop-blur-2xl p-5 text-panel-ink font-ui shadow-2xl"
      >
        <SheetHeader className="text-right">
          <SheetTitle className="font-ui text-panel-ink">المحتويات</SheetTitle>
        </SheetHeader>
        <div className="mt-2 overflow-y-auto pb-8">
          <p className="px-1 pb-4 text-sm text-panel-ink/60">
            {book.title} — {book.author}
          </p>
          <ul className="space-y-1">
            {book.chapters.map((chapter, index) => {
              const active = chapter.id === activeChapterId;
              return (
                <li key={chapter.id}>
                  <button
                    onClick={() => onSelect(chapter.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors hover:bg-panel-rule ${
                      active ? "bg-panel-rule font-semibold" : ""
                    }`}
                  >
                    <span className="w-6 shrink-0 text-sm text-panel-ink/60">{index + 1}</span>
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

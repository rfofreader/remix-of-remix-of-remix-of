import { Trash2, StickyNote, Quote } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Book } from "@/data/sample-book";
import type { Highlight } from "@/lib/reader-storage";
import { highlightColorClass } from "@/lib/reader-selection";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  highlights: Highlight[];
  onGoTo: (highlight: Highlight) => void;
  onDelete: (id: string) => void;
  onNote: (highlight: Highlight) => void;
  onShare: (highlight: Highlight) => void;
}

export function HighlightsSheet({
  open,
  onOpenChange,
  book,
  highlights,
  onGoTo,
  onDelete,
  onNote,
  onShare,
}: Props) {
  const chapterTitle = (chapterId: string) =>
    book.chapters.find((chapter) => chapter.id === chapterId)?.title ?? "";

  const sorted = [...highlights].sort((a, b) => b.createdAt - a.createdAt);

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
          <SheetTitle className="font-ui text-panel-ink">
            التظليلات والملاحظات {sorted.length ? `(${sorted.length})` : ""}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 overflow-y-auto pb-8">
          {sorted.length === 0 ? (
            <p className="py-10 text-center text-sm leading-7 text-panel-ink/60">
              لا توجد تظليلات بعد.
              <br />
              اضغط مطوّلاً على النص واسحب لتحديد مقطع ثم اختر لوناً.
            </p>
          ) : (
            <ul className="space-y-3">
              {sorted.map((highlight) => (
                <li
                  key={highlight.id}
                  className="rounded-2xl border border-panel-rule p-3 text-right"
                >
                  <p className="text-xs text-panel-ink/60">{chapterTitle(highlight.chapterId)}</p>
                  <button
                    onClick={() => onGoTo(highlight)}
                    className="mt-2 block w-full text-right"
                  >
                    <span
                      className={`font-reading text-[15px] leading-8 ${
                        highlightColorClass[highlight.color]
                      }`}
                    >
                      {highlight.text}
                    </span>
                  </button>
                  {highlight.note ? (
                    <p className="mt-2 rounded-xl bg-panel-rule px-3 py-2 text-sm leading-6">
                      {highlight.note}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-1 text-panel-ink/60">
                    <button
                      onClick={() => onNote(highlight)}
                      className="rounded-lg p-2 transition-colors hover:bg-panel-rule"
                      aria-label="ملاحظة"
                    >
                      <StickyNote className="size-4" />
                    </button>
                    <button
                      onClick={() => onShare(highlight)}
                      className="rounded-lg p-2 transition-colors hover:bg-panel-rule"
                      aria-label="بطاقة اقتباس"
                    >
                      <Quote className="size-4" />
                    </button>
                    <button
                      onClick={() => onDelete(highlight.id)}
                      className="rounded-lg p-2 transition-colors hover:bg-panel-rule"
                      aria-label="حذف"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

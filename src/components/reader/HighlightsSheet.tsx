import { Trash2, StickyNote, Quote } from "lucide-react";
import { PopupPanel } from "@/components/reader/PopupPanel";
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
    <PopupPanel
      open={open}
      onOpenChange={onOpenChange}
      title="التظليلات والملاحظات"
      subtitle={sorted.length ? `${sorted.length} عنصر` : undefined}
    >
      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm leading-7 text-panel-ink/55">
          لا توجد تظليلات بعد.
          <br />
          اضغط مطوّلاً على النص واسحب لتحديد مقطع ثم اختر لوناً.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((highlight) => (
            <li key={highlight.id} className="rounded-2xl border border-panel-rule p-3 text-right">
              <p className="text-xs text-panel-ink/55">{chapterTitle(highlight.chapterId)}</p>
              <button onClick={() => onGoTo(highlight)} className="mt-2 block w-full text-right">
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
              <div className="mt-3 flex items-center gap-1 text-panel-ink/55">
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
    </PopupPanel>
  );
}

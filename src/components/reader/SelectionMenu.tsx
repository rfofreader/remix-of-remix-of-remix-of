import { useLayoutEffect, useRef, useState } from "react";
import { Copy, Highlighter, Quote, StickyNote, Trash2 } from "lucide-react";
import type { HighlightColor } from "@/lib/reader-storage";


export interface SelectionMenuState {
  top: number;
  left: number;
  existingId?: string;
}

interface Props {
  state: SelectionMenuState;
  onHighlight: (color: HighlightColor) => void;
  onNote: () => void;
  onQuote: () => void;
  onCopy: () => void;
  onDelete?: () => void;
}

const colors: { id: HighlightColor; className: string }[] = [
  { id: "yellow", className: "bg-hl-yellow" },
  { id: "green", className: "bg-hl-green" },
  { id: "blue", className: "bg-hl-blue" },
  { id: "pink", className: "bg-hl-pink" },
];

export function SelectionMenu({
  state,
  onHighlight,
  onNote,
  onQuote,
  onCopy,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState<number | null>(null);

  /* إبقاء الشريط بالكامل داخل حدود الشاشة مهما كان موضع التحديد */
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const margin = 10;
    const width = element.offsetWidth;
    const max = window.innerWidth - width - margin;
    setLeft(Math.max(margin, Math.min(max, state.left - width / 2)));
  }, [state.left, state.top]);

  return (
    <div
      ref={ref}
      dir="rtl"
      className="animate-in fade-in zoom-in-95 fixed z-50 duration-150"
      style={{ top: state.top, left: left ?? state.left, visibility: left === null ? "hidden" : "visible" }}
      onMouseDown={(event) => event.preventDefault()}
    >

      <div className="flex items-center gap-1 rounded-2xl bg-chrome px-2 py-1.5 text-chrome-ink shadow-xl">
        <div className="flex items-center gap-1 pl-1">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => onHighlight(color.id)}
              aria-label={`تظليل ${color.id}`}
              className={`size-7 rounded-full border border-chrome-ink/25 ${color.className}`}
            />
          ))}
        </div>
        <span className="mx-1 h-6 w-px bg-chrome-ink/20" />
        <button
          onClick={() => onHighlight("yellow")}
          className="rounded-xl p-2 transition-colors hover:bg-chrome-ink/15"
          aria-label="تظليل"
        >
          <Highlighter className="size-4" />
        </button>
        <button
          onClick={onNote}
          className="rounded-xl p-2 transition-colors hover:bg-chrome-ink/15"
          aria-label="ملاحظة"
        >
          <StickyNote className="size-4" />
        </button>
        <button
          onClick={onQuote}
          className="rounded-xl p-2 transition-colors hover:bg-chrome-ink/15"
          aria-label="بطاقة اقتباس"
        >
          <Quote className="size-4" />
        </button>
        <button
          onClick={onCopy}
          className="rounded-xl p-2 transition-colors hover:bg-chrome-ink/15"
          aria-label="نسخ"
        >
          <Copy className="size-4" />
        </button>
        {onDelete ? (
          <button
            onClick={onDelete}
            className="rounded-xl p-2 transition-colors hover:bg-chrome-ink/15"
            aria-label="حذف"
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

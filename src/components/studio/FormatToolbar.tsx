import { useRef, useState } from "react";
import {
  Bold,
  Code,
  GripHorizontal,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  X,
} from "lucide-react";

export interface FormatAction {
  /** يُدرج قبل النص المحدَّد */
  prefix: string;
  /** يُدرج بعد النص المحدَّد */
  suffix?: string;
  /** يُطبَّق في بداية السطر بدل الالتفاف */
  line?: boolean;
}

interface Props {
  onApply: (action: FormatAction) => void;
  onClose: () => void;
}

const groups: { id: string; icon: typeof Bold; label: string; action: FormatAction }[][] = [
  [
    { id: "bold", icon: Bold, label: "عريض", action: { prefix: "**", suffix: "**" } },
    { id: "italic", icon: Italic, label: "مائل", action: { prefix: "*", suffix: "*" } },
    {
      id: "strike",
      icon: Strikethrough,
      label: "مشطوب",
      action: { prefix: "~~", suffix: "~~" },
    },
    { id: "code", icon: Code, label: "شفرة", action: { prefix: "`", suffix: "`" } },
  ],
  [
    { id: "h1", icon: Heading1, label: "عنوان رئيسي", action: { prefix: "# ", line: true } },
    { id: "h2", icon: Heading2, label: "عنوان فرعي", action: { prefix: "## ", line: true } },
    { id: "h3", icon: Heading3, label: "عنوان صغير", action: { prefix: "### ", line: true } },
  ],
  [
    { id: "quote", icon: Quote, label: "اقتباس", action: { prefix: "> ", line: true } },
    { id: "ul", icon: List, label: "قائمة نقطية", action: { prefix: "- ", line: true } },
    { id: "ol", icon: ListOrdered, label: "قائمة رقمية", action: { prefix: "1. ", line: true } },
    { id: "hr", icon: Minus, label: "فاصل", action: { prefix: "\n---\n", line: true } },
  ],
  [
    {
      id: "link",
      icon: Link2,
      label: "رابط",
      action: { prefix: "[", suffix: "](https://)" },
    },
    {
      id: "image",
      icon: Image,
      label: "صورة",
      action: { prefix: "![", suffix: "](https://)" },
    },
  ],
];

/** لوحة تنسيق نص عائمة وقابلة للسحب، لا تغطّي الشاشة. */
export function FormatToolbar({ onApply, onClose }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const start = (clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = { dx: clientX - rect.left, dy: clientY - rect.top };
  };

  const move = (clientX: number, clientY: number) => {
    const current = drag.current;
    const rect = ref.current?.getBoundingClientRect();
    if (!current || !rect) return;
    const x = Math.min(
      Math.max(8, clientX - current.dx),
      window.innerWidth - rect.width - 8,
    );
    const y = Math.min(
      Math.max(8, clientY - current.dy),
      window.innerHeight - rect.height - 8,
    );
    setPos({ x, y });
  };

  return (
    <div
      ref={ref}
      dir="rtl"
      style={
        pos
          ? { top: pos.y, left: pos.x, right: "auto", bottom: "auto" }
          : { bottom: 96, left: 20, right: 20 }
      }
      className="fixed z-50 w-auto max-w-[min(420px,calc(100vw-40px))] rounded-2xl border border-panel-rule bg-panel p-2 text-panel-ink shadow-2xl"
      onPointerMove={(event) => {
        if (drag.current) move(event.clientX, event.clientY);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
    >
      <div className="flex items-center justify-between pb-1">
        <div
          onPointerDown={(event) => {
            (event.target as HTMLElement).setPointerCapture(event.pointerId);
            start(event.clientX, event.clientY);
          }}
          className="flex flex-1 cursor-grab touch-none items-center justify-center py-1 text-panel-ink/40 active:cursor-grabbing"
          aria-label="اسحب لتحريك اللوحة"
        >
          <GripHorizontal className="size-5" />
        </div>
        <button onClick={onClose} aria-label="إغلاق لوحة التنسيق" className="p-1 text-panel-ink/50">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {groups.map((group, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 ? <span className="mx-1 h-5 w-px bg-panel-rule" /> : null}
            {group.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onApply(item.action)}
                className="rounded-lg p-2 transition-colors hover:bg-panel-rule"
              >
                <item.icon className="size-4" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

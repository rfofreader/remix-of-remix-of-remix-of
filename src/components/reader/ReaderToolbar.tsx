import { ChevronDown, List, Search, Sun, NotebookPen } from "lucide-react";

interface Props {
  visible: boolean;
  page: number;
  totalPages: number;
  percent: number;
  onToc: () => void;
  onSearch: () => void;
  onDisplay: () => void;
  onHighlights: () => void;
  onHide: () => void;
}

export function ReaderToolbar({
  visible,
  page,
  totalPages,
  percent,
  onToc,
  onSearch,
  onDisplay,
  onHighlights,
  onHide,
}: Props) {
  return (
    <div
      dir="ltr"
      className={`fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-1 pb-3 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center gap-2 px-3">
        <IconButton label="المحتويات" onClick={onToc}>
          <List className="size-5" />
        </IconButton>
        <IconButton label="بحث" onClick={onSearch}>
          <Search className="size-5" />
        </IconButton>
        <div className="rounded-full bg-chrome px-5 py-3 text-sm font-medium text-chrome-ink tabular-nums shadow-lg">
          {page}/{totalPages} • {percent}%
        </div>
        <IconButton label="المظهر" onClick={onDisplay}>
          <Sun className="size-5" />
        </IconButton>
        <IconButton label="التظليلات" onClick={onHighlights}>
          <NotebookPen className="size-5" />
        </IconButton>
      </div>
      <button
        onClick={onHide}
        aria-label="إخفاء الشريط"
        className="rounded-full p-1 text-ink-soft transition-colors hover:text-ink"
      >
        <ChevronDown className="size-6" />
      </button>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex size-12 items-center justify-center rounded-full bg-chrome text-chrome-ink shadow-lg transition-transform active:scale-95"
    >
      {children}
    </button>
  );
}

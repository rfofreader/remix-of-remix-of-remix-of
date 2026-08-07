import { Link } from "@tanstack/react-router";
import { BookOpenIcon, BookmarkIcon } from "@/components/icons/AppIcons";

interface Props {
  bookId: string;
  title: string;
  author: string;
  ratio: number;
}

/** الشريط السفلي الثابت لمتابعة القراءة — الصفحة الرئيسية فقط. */
export function ContinueBar({ bookId, title, author, ratio }: Props) {
  const percent = Math.max(2, Math.round(ratio * 100));

  return (
    <div
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-[1.75rem] bg-panel px-4 pt-4 pb-5 text-panel-ink"
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3">
        <Link
          to="/library"
          aria-label="كل الكتب"
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-paper text-ink"
        >
          <BookOpenIcon className="size-7" />
        </Link>

        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-panel-ink/70">{author}</p>
        </div>

        <Link
          to="/highlights"
          aria-label="العلامات المرجعية"
          className="shrink-0 text-panel-ink"
        >
          <BookmarkIcon className="size-6" />
        </Link>

        <Link
          to="/read/$bookId"
          params={{ bookId }}
          aria-label="متابعة القراءة"
          className="shrink-0 text-panel-ink"
        >
          <BookOpenIcon className="size-6" />
        </Link>
      </div>

      <div className="mx-auto mt-3 h-1 w-full max-w-md overflow-hidden rounded-full bg-panel-ink/25">
        <div className="h-full rounded-full bg-panel-ink" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

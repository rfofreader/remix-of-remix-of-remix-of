import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, Home, Library, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteTheme } from "@/hooks/use-site-theme";
import { fetchHistory, type BookWithCategory } from "@/lib/books-api";

type RoutePath = "/" | "/shelves" | "/library" | "/account";

interface Item {
  to: RoutePath;
  label: string;
  icon: typeof Library;
}

/* ترتيب RTL: الرئيسية أقصى اليمين ثم رفوفي — الزر الأوسط مركز القراءة */
const rightItems: Item[] = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/shelves", label: "رفوفي", icon: Library },
];
const leftItems: Item[] = [
  { to: "/library", label: "استكشف", icon: Compass },
  { to: "/account", label: "حسابي", icon: User },
];

/** شريط تنقّل سفلي من خمسة أزرار مع مركز قراءة في الوسط. */
export function MenuNav({ extra, bottomClass = "bottom-5" }: { extra?: ReactNode; bottomClass?: string }) {
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<{ book: BookWithCategory; ratio: number }[]>([]);
  const { user } = useAuth();
  const { theme, toggle } = useSiteTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user || !open) return;
    void fetchHistory(user.id).then((rows) =>
      setReading(
        rows
          .filter((row) => !!row.books)
          .map((row) => ({ book: row.books as BookWithCategory, ratio: row.ratio })),
      ),
    );
  }, [user, open]);

  const isActive = (to: RoutePath) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div
      dir="rtl"
      className={`pointer-events-none fixed inset-x-0 ${bottomClass} z-50 mx-auto flex w-full max-w-md flex-col items-center px-5`}
    >
      {open ? (
        <button
          aria-label="إغلاق مركز القراءة"
          onClick={() => setOpen(false)}
          className="pointer-events-auto fixed inset-0 -z-10 cursor-default bg-ink/25 backdrop-blur-[2px]"
        />
      ) : null}

      {open ? (
        <div className="pointer-events-auto mb-3 w-full overflow-hidden rounded-[1.5rem] bg-panel p-3 text-panel-ink shadow-[0_18px_36px_-18px_rgb(0_0_0/0.7)]">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-sm font-medium">مركز القراءة</span>
            <button
              onClick={toggle}
              aria-label="تبديل الوضع"
              className="grid size-8 place-items-center rounded-full bg-panel-rule"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {reading.map(({ book, ratio }) => (
              <li key={book.id}>
                <button
                  onClick={() => {
                    setOpen(false);
                    void navigate({ to: "/read/$bookId", params: { bookId: book.id } });
                  }}
                  className="w-full rounded-2xl px-3 py-2.5 text-right transition-colors hover:bg-panel-rule"
                >
                  <span className="block truncate text-sm">{book.title}</span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-panel-rule">
                    <span
                      className="block h-full rounded-full bg-panel-ink/70"
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </span>
                </button>
              </li>
            ))}
            {reading.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-panel-ink/60">
                {user ? "لم تبدأ قراءة أي كتاب بعد." : "سجّل الدخول لمتابعة قراءاتك."}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {extra ? <div className="pointer-events-auto mb-3 flex flex-col items-center gap-3">{extra}</div> : null}

      <nav className="pointer-events-auto flex w-full items-center justify-between rounded-full bg-panel px-5 py-2.5 text-panel-ink shadow-[0_14px_28px_-16px_rgb(0_0_0/0.7)]">
        {rightItems.map((item) => (
          <NavItem key={item.to} item={item} active={isActive(item.to)} />
        ))}

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label="مركز القراءة"
          aria-expanded={open}
          className="-my-4 grid size-14 shrink-0 place-items-center rounded-full bg-brand text-brand-ink shadow-[0_10px_22px_-12px_rgb(0_0_0/0.8)] transition-transform active:scale-95"
        >
          <BookOpen className="size-6" />
        </button>

        {leftItems.map((item) => (
          <NavItem key={item.to} item={item} active={isActive(item.to)} />
        ))}
      </nav>
    </div>
  );
}

function NavItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      to={item.to}
      aria-label={item.label}
      className={`flex w-14 flex-col items-center gap-1 py-1 transition-opacity ${
        active ? "opacity-100" : "opacity-55"
      }`}
    >
      <item.icon className="size-5" strokeWidth={1.7} />
      <span className="text-[10px] leading-none">{item.label}</span>
    </Link>
  );
}

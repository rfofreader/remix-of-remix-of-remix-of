import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  Highlighter,
  Library,
  Moon,
  PenLine,
  ShoppingBag,
  Sun,
  User,
} from "lucide-react";
import { CloseIcon, MenuIcon } from "@/components/icons/AppIcons";
import { useAuth } from "@/hooks/use-auth";
import { useSiteTheme } from "@/hooks/use-site-theme";


type RoutePath = "/" | "/library" | "/highlights" | "/store" | "/account" | "/studio";

interface Item {
  to: RoutePath;
  label: string;
  icon: typeof Library;
}

const baseItems: Item[] = [
  { to: "/", label: "الرئيسية", icon: Library },
  { to: "/library", label: "المكتبة", icon: BookOpen },
  { to: "/highlights", label: "التظليلات", icon: Highlighter },
  { to: "/store", label: "المتجر", icon: ShoppingBag },
  { to: "/account", label: "حسابي", icon: User },
];

const rowClass =
  "flex items-center justify-end gap-2.5 rounded-2xl py-2.5 pr-4 pl-4 text-sm font-medium shadow-[0_10px_24px_-14px_rgb(0_0_0/0.6)] transition-colors";

/** زر قائمة عائم يفتح شريط تنقّل عمودي منبثق (RTL: أقصى اليمين). */
export function MenuNav({ extra }: { extra?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { theme, toggle } = useSiteTheme();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items: Item[] = isAdmin
    ? [...baseItems, { to: "/studio", label: "لوحة الكتابة", icon: PenLine }]
    : baseItems;

  return (
    <div
      dir="rtl"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 mx-auto flex w-full max-w-md flex-col items-end px-5"
    >
      {open ? (
        <button
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
          className="pointer-events-auto fixed inset-0 -z-10 cursor-default bg-ink/25 backdrop-blur-[2px]"
        />
      ) : null}

      <ul
        className={`mb-3 flex flex-col items-end gap-2 transition-all duration-200 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {items.map((item, index) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          /* الأقرب إلى الزر يظهر أولاً ثم يصعد الباقي للأعلى */
          const delay = open ? (items.length - index) * 35 : 0;
          return (
            <li
              key={item.to}
              style={{ transitionDelay: `${delay}ms`, transformOrigin: "bottom center" }}
              className={`transition-all duration-200 ease-out ${
                open
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-8 scale-90 opacity-0"
              }`}
            >
              <Link
                to={item.to}
                className={`${rowClass} ${
                  active
                    ? "bg-brand text-brand-ink"
                    : "bg-panel text-panel-ink hover:bg-panel-rule"
                }`}
              >
                {item.label}
                <item.icon className="size-4 shrink-0 opacity-80" />
              </Link>
            </li>
          );
        })}

        <li
          style={{ transitionDelay: "0ms", transformOrigin: "bottom center" }}
          className={`transition-all duration-200 ease-out ${
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-90 opacity-0"
          }`}
        >
          <button
            onClick={toggle}
            className={`${rowClass} bg-panel text-panel-ink hover:bg-panel-rule`}
          >
            {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
            {theme === "dark" ? (
              <Sun className="size-4 shrink-0 opacity-80" />
            ) : (
              <Moon className="size-4 shrink-0 opacity-80" />
            )}
          </button>
        </li>

        <li
          style={{ transitionDelay: "0ms", transformOrigin: "bottom center" }}
          className={`transition-all duration-200 ease-out ${
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-90 opacity-0"
          }`}
        >
          <span className="flex items-center gap-2 rounded-2xl bg-panel/70 px-3 py-1.5 text-[11px] text-panel-ink/60">
            تصفّح
            <Compass className="size-3.5" />
          </span>
        </li>
      </ul>

      {extra ? <div className="pointer-events-auto mb-3 flex flex-col gap-3">{extra}</div> : null}

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
        className="pointer-events-auto flex size-14 items-center justify-center rounded-3xl bg-brand text-brand-ink shadow-[0_14px_28px_-14px_rgb(0_0_0/0.7)] transition-transform active:scale-95"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
    </div>
  );
}

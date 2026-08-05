import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  Library,
  Menu,
  PenLine,
  ShoppingBag,
  Tags,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type RoutePath = "/" | "/library" | "/categories" | "/store" | "/account" | "/studio";

interface Item {
  to: RoutePath;
  label: string;
  icon: typeof Library;
}

const baseItems: Item[] = [
  { to: "/", label: "الرئيسية", icon: Library },
  { to: "/library", label: "المكتبة", icon: BookOpen },
  { to: "/categories", label: "التصنيفات", icon: Tags },
  { to: "/store", label: "المتجر", icon: ShoppingBag },
  { to: "/account", label: "حسابي", icon: User },
];

/** زر قائمة عائم يفتح شريط تنقّل عمودي منبثق (RTL: أقصى اليمين). */
export function MenuNav() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items: Item[] = isAdmin
    ? [...baseItems, { to: "/studio", label: "لوحة الكتابة", icon: PenLine }]
    : baseItems;

  return (
    <div dir="rtl" className="fixed right-4 bottom-5 z-50 flex flex-col items-end">
      {open ? (
        <button
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 cursor-default bg-ink/25 backdrop-blur-[2px]"
        />
      ) : null}

      <ul
        className={`mb-3 flex flex-col items-end gap-2 transition-all duration-200 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {items.map((item, index) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <li
              key={item.to}
              style={{ transitionDelay: `${open ? index * 35 : 0}ms` }}
              className={`transition-all duration-200 ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <Link
                to={item.to}
                className={`flex items-center gap-2.5 rounded-lg py-2.5 pr-3 pl-4 text-sm font-medium shadow-[0_10px_24px_-14px_rgb(0_0_0/0.6)] transition-colors ${
                  active
                    ? "bg-brand text-brand-ink"
                    : "bg-panel text-panel-ink hover:bg-panel-rule"
                }`}
              >
                <item.icon className="size-4 shrink-0 opacity-80" />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li
          style={{ transitionDelay: open ? `${items.length * 35}ms` : "0ms" }}
          className={`transition-all duration-200 ${
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span className="flex items-center gap-2 rounded-lg bg-panel/70 px-3 py-1.5 text-[11px] text-panel-ink/60">
            <Compass className="size-3.5" />
            تصفّح
          </span>
        </li>
      </ul>

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-xl bg-brand text-brand-ink shadow-[0_14px_28px_-14px_rgb(0_0_0/0.7)] transition-transform active:scale-95"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
    </div>
  );
}

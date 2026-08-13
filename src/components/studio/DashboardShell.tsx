import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type DashTab = "overview" | "books" | "authors" | "categories";

const TABS: { key: DashTab; label: string }[] = [
  { key: "overview", label: "نظرة عامة" },
  { key: "books", label: "الكتب" },
  { key: "authors", label: "المؤلفون" },
  { key: "categories", label: "التصنيفات" },
];

/** هيكل لوحة النشر — كثافة أعلى من واجهة القارئ، وألوان --dash-* مستقلة. */
export function DashboardShell({
  children,
  title,
  subtitle,
  actions,
  tab,
  onTab,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  tab: DashTab;
  onTab: (tab: DashTab) => void;
}) {
  return (
    <div dir="rtl" className="min-h-dvh bg-dash-bg text-dash-fg" style={{ fontFamily: "var(--font-ui)" }}>
      <header className="sticky top-0 z-20 border-b border-dash-border bg-dash-surface px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto grid max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" aria-label="العودة إلى التطبيق" className="grid size-10 place-items-center rounded-md border border-dash-border">
            <ArrowRight className="size-4" strokeWidth={1.6} />
          </Link>
          <div className="min-w-0">
            <p className="text-[0.6875rem] text-dash-muted">لوحة النشر · رفوف</p>
            <h1 className="truncate text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              onClick={() => void supabase.auth.signOut()}
              aria-label="تسجيل الخروج"
              className="grid size-10 place-items-center rounded-md border border-dash-border"
            >
              <LogOut className="size-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>
        <nav aria-label="تنقل اللوحة" className="mx-auto mt-2 flex max-w-5xl gap-1 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => onTab(item.key)}
              className={cn(
                "flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-[0.8125rem] transition-colors",
                tab === item.key ? "bg-dash-fg/10 font-medium text-dash-fg" : "text-dash-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 pb-24">{children}</main>

      {subtitle ? (
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-[0.6875rem] text-dash-muted">{subtitle}</footer>
      ) : null}
    </div>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-dash-border bg-dash-surface p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  full,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  full?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full rounded-md border border-dash-border bg-dash-bg px-3 py-2.5 text-sm outline-none focus-visible:border-dash-accent";
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="mb-1 block text-[0.75rem] text-dash-muted">{label}</span>
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className={cls}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}

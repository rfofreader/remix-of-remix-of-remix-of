import type { ReactNode } from "react";
import { MenuNav } from "@/components/nav/MenuNav";
import { useSiteTheme } from "@/hooks/use-site-theme";

interface Props {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  /** ترويسة مخصّصة تحلّ محل العنوان الافتراضي. */
  header?: ReactNode;
  children: ReactNode;
}

/** إطار الصفحات العامة: خلفية ورقية + ترويسة + قائمة التنقّل العائمة. */
export function AppPage({ title, subtitle, action, header, children }: Props) {
  const { theme } = useSiteTheme();

  return (
    <main
      dir="rtl"
      className={`paper-${theme} min-h-screen bg-paper px-5 pt-10 pb-28`}
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-md">
        {header ?? (
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-reading text-3xl leading-tight text-ink">{title}</h1>
              {subtitle ? <p className="pt-2 text-sm text-ink-soft">{subtitle}</p> : null}
            </div>
            {action}
          </header>
        )}
        {children}
      </div>
      <MenuNav />
    </main>
  );
}

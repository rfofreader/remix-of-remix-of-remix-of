import type { ReactNode } from "react";
import { MenuNav } from "@/components/nav/MenuNav";
import { useSiteTheme } from "@/hooks/use-site-theme";

interface Props {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

/** إطار الصفحات العامة: خلفية ورقية + ترويسة + قائمة التنقّل العائمة. */
export function AppPage({ title, subtitle, header, action, children }: Props) {
  const { theme } = useSiteTheme();

  return (
    <main
      dir="rtl"
      className={`paper-${theme} min-h-screen bg-paper px-5 pt-10 pb-28`}
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-md">
        {header ?? (
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              {title ? (
                <h1 className="font-reading text-3xl leading-tight text-ink">{title}</h1>
              ) : null}
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

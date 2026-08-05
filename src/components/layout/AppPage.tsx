import { useEffect, type ReactNode } from "react";
import { MenuNav } from "@/components/nav/MenuNav";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** إطار الصفحات العامة: خلفية ورقية + ترويسة + قائمة التنقّل العائمة. */
export function AppPage({ title, subtitle, action, children }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    const classes = ["paper-light", "paper-sepia", "paper-dark"];
    root.classList.remove(...classes);
    root.classList.add("paper-sepia");
    document.body.style.backgroundColor = "var(--paper)";
    return () => root.classList.remove("paper-sepia");
  }, []);

  return (
    <main
      dir="rtl"
      className="paper-sepia min-h-screen bg-paper px-5 pt-10 pb-28"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-reading text-3xl leading-tight text-ink">{title}</h1>
            {subtitle ? <p className="pt-2 text-sm text-ink-soft">{subtitle}</p> : null}
          </div>
          {action}
        </header>
        {children}
      </div>
      <MenuNav />
    </main>
  );
}

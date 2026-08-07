import type { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MenuNav } from "@/components/nav/MenuNav";
import { useSiteTheme } from "@/hooks/use-site-theme";

interface Props {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  /** ترويسة مخصّصة تحلّ محل العنوان الافتراضي. */
  header?: ReactNode;
  /** إخفاء زر الرجوع (الصفحة الرئيسية). */
  hideBack?: boolean;
  /** أزرار عائمة تُعرض فوق زر القائمة. */
  navExtra?: ReactNode;
  children: ReactNode;
}

/** إطار الصفحات العامة: خلفية ورقية + ترويسة + قائمة التنقّل العائمة. */
export function AppPage({
  title,
  subtitle,
  action,
  header,
  hideBack,
  navExtra,
  children,
}: Props) {
  const { theme } = useSiteTheme();
  const router = useRouter();

  return (
    <main
      dir="rtl"
      className={`site-${theme} min-h-screen bg-paper px-5 pt-10 pb-28`}
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {hideBack ? null : (
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="رجوع"
          className="fixed top-4 right-4 z-40 text-ink opacity-70 transition-opacity active:opacity-100"
        >
          <ArrowRight className="size-6" />
        </button>
      )}

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
      <MenuNav extra={navExtra} />
    </main>
  );
}

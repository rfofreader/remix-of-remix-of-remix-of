import { useCallback, useEffect, useState } from "react";

export type SiteTheme = "sepia" | "dark";

const KEY = "site:theme";

function read(): SiteTheme {
  if (typeof window === "undefined") return "sepia";
  return window.localStorage.getItem(KEY) === "dark" ? "dark" : "sepia";
}

function apply(theme: SiteTheme) {
  const root = document.documentElement;
  root.classList.remove("paper-light", "paper-sepia", "paper-dark");
  root.classList.add(`paper-${theme}`);
  document.body.style.backgroundColor = "var(--paper)";
}

/** وضع الموقع (سيبيا/داكن) — مستقل تماماً عن إعدادات القارئ. */
export function useSiteTheme() {
  const [theme, setTheme] = useState<SiteTheme>("sepia");

  useEffect(() => {
    const initial = read();
    setTheme(initial);
    apply(initial);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: SiteTheme = current === "dark" ? "sepia" : "dark";
      window.localStorage.setItem(KEY, next);
      apply(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

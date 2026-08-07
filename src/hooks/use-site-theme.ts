import { useCallback, useEffect, useState } from "react";

export type SiteTheme = "cream" | "dark";

const KEY = "site:theme";

function read(): SiteTheme {
  if (typeof window === "undefined") return "cream";
  return window.localStorage.getItem(KEY) === "dark" ? "dark" : "cream";
}

function apply(theme: SiteTheme) {
  const root = document.documentElement;
  root.classList.remove("paper-light", "paper-sepia", "paper-dark", "site-cream", "site-dark");
  root.classList.add(`site-${theme}`);

  document.body.style.backgroundColor = "var(--paper)";
}

/** وضع الموقع (كريمي/داكن) — مستقل تماماً عن إعدادات القارئ. */
export function useSiteTheme() {
  const [theme, setTheme] = useState<SiteTheme>("cream");

  useEffect(() => {
    const initial = read();
    setTheme(initial);
    apply(initial);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: SiteTheme = current === "dark" ? "cream" : "dark";
      window.localStorage.setItem(KEY, next);
      apply(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

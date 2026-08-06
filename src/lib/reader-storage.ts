export type HighlightColor = "yellow" | "green" | "blue" | "pink";
export type ReaderTheme = "light" | "sepia" | "dark";
export type ReaderFont = "plex" | "uthman" | "amiri" | "naskh" | "cairo";

export const readerFonts: { id: ReaderFont; label: string; stack: string }[] = [
  { id: "plex", label: "IBM Plex Arabic", stack: '"IBM Plex Sans Arabic", system-ui, sans-serif' },
  { id: "uthman", label: "عثمان طه", stack: '"Uthman Taha", "Noto Naskh Arabic", serif' },
  { id: "amiri", label: "أميري", stack: '"Amiri", serif' },
  { id: "naskh", label: "نسخ", stack: '"Noto Naskh Arabic", serif' },
  { id: "cairo", label: "القاهرة", stack: '"Cairo", sans-serif' },
];

export function fontStack(id: ReaderFont): string {
  return readerFonts.find((font) => font.id === id)?.stack ?? readerFonts[0]!.stack;
}

export interface Highlight {
  id: string;
  chapterId: string;
  paragraphId: string;
  start: number;
  end: number;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
}

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number;
  lineHeight: number;
  width: number;
  font: ReaderFont;
  bold: boolean;
}

export const defaultSettings: ReaderSettings = {
  theme: "dark",
  fontSize: 18,
  lineHeight: 1.9,
  width: 640,
  font: "plex",
  bold: false,
};

const KEY = (bookId: string, kind: string) => `reader:${bookId}:${kind}`;
/** إعدادات القارئ عامة لكل الكتب ويتم تذكّرها بين الجلسات. */
const SETTINGS_KEY = "reader:settings";

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function loadSettings(): ReaderSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ReaderSettings) {
  write(SETTINGS_KEY, settings);
}


export function loadHighlights(bookId: string): Highlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY(bookId, "highlights"));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Highlight[]) : [];
  } catch {
    return [];
  }
}

export function saveHighlights(bookId: string, highlights: Highlight[]) {
  write(KEY(bookId, "highlights"), highlights);
}

export function loadProgress(bookId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(KEY(bookId, "progress"));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveProgress(bookId: string, scrollY: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY(bookId, "progress"), String(Math.round(scrollY)));
}

export function loadProgressRatio(bookId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(KEY(bookId, "ratio"));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export function saveProgressRatio(bookId: string, ratio: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY(bookId, "ratio"), String(ratio));
}

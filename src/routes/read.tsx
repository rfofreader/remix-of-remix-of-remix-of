import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { sampleBook, totalChars } from "@/data/sample-book";
import {
  defaultSettings,
  loadHighlights,
  loadProgress,
  loadSettings,
  saveHighlights,
  saveProgress,
  saveSettings,
  type Highlight,
  type HighlightColor,
  type ReaderSettings,
} from "@/lib/reader-storage";
import { clearSelection, readSelection, type ReadSelection } from "@/lib/reader-selection";
import { ReaderSurface } from "@/components/reader/ReaderSurface";
import { ReaderToolbar } from "@/components/reader/ReaderToolbar";
import { TocSheet } from "@/components/reader/TocSheet";
import { SearchSheet } from "@/components/reader/SearchSheet";
import { DisplaySettingsSheet } from "@/components/reader/DisplaySettingsSheet";
import { HighlightsSheet } from "@/components/reader/HighlightsSheet";
import { SelectionMenu, type SelectionMenuState } from "@/components/reader/SelectionMenu";
import { QuoteCard } from "@/components/reader/QuoteCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "القارئ — أثر الهدوء" },
      {
        name: "description",
        content:
          "قارئ إلكتروني عربي بتجربة قراءة هادئة: تظليل النص، ملاحظات، بحث داخل الكتاب، فهرس، وأوضاع عرض فاتح وسيبيا وداكن.",
      },
      { property: "og:title", content: "القارئ — أثر الهدوء" },
      {
        property: "og:description",
        content: "اقرأ وظلّل ودوّن ملاحظاتك في تجربة قراءة عربية هادئة.",
      },
    ],
  }),
  component: ReaderPage,
});

const CHARS_PER_PAGE = 420;

function ReaderPage() {
  const book = sampleBook;
  const surfaceRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [chromeVisible, setChromeVisible] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);

  const [selection, setSelection] = useState<ReadSelection | null>(null);
  const [menu, setMenu] = useState<SelectionMenuState | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [quoteText, setQuoteText] = useState<string | null>(null);
  const [noteTarget, setNoteTarget] = useState<Highlight | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const [progress, setProgress] = useState(0);
  const [activeChapterId, setActiveChapterId] = useState(book.chapters[0]?.id ?? "");

  const totalPages = useMemo(
    () => Math.max(1, Math.round(totalChars(book) / CHARS_PER_PAGE)),
    [book],
  );
  const page = Math.min(totalPages, Math.max(1, Math.round(progress * totalPages) || 1));
  const percent = Math.round(progress * 100);

  /* ---------- hydrate from local storage ---------- */
  useEffect(() => {
    setSettings(loadSettings(book.id));
    setHighlights(loadHighlights(book.id));
    setHydrated(true);
    const saved = loadProgress(book.id);
    if (saved > 0) {
      requestAnimationFrame(() => window.scrollTo({ top: saved }));
    }
  }, [book.id]);

  useEffect(() => {
    if (hydrated) saveSettings(book.id, settings);
  }, [settings, hydrated, book.id]);

  useEffect(() => {
    if (hydrated) saveHighlights(book.id, highlights);
  }, [highlights, hydrated, book.id]);

  /* ---------- theme tokens must reach portals (sheets/dialogs) ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const classes = ["paper-light", "paper-sepia", "paper-dark"];
    root.classList.remove(...classes);
    root.classList.add(`paper-${settings.theme}`);
    document.body.style.backgroundColor = "var(--paper)";
    return () => root.classList.remove(...classes);
  }, [settings.theme]);

  /* ---------- progress + active chapter + auto-hiding chrome ---------- */
  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(ratio);
      saveProgress(book.id, window.scrollY);

      const delta = window.scrollY - lastScrollY.current;
      if (Math.abs(delta) > 6) {
        setChromeVisible(delta < 0 || window.scrollY < 24);
        lastScrollY.current = window.scrollY;
      }

      let current = book.chapters[0]?.id ?? "";
      for (const chapter of book.chapters) {
        const element = document.getElementById(chapter.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = chapter.id;
        }
      }
      setActiveChapterId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [book]);


  /* ---------- selection handling ---------- */
  const positionFromRect = (rect: DOMRect): SelectionMenuState => {
    const top = rect.top > 90 ? rect.top - 60 : rect.bottom + 12;
    return { top, left: Math.min(window.innerWidth - 20, Math.max(20, rect.left + rect.width / 2)) };
  };

  useEffect(() => {
    const onSelectionChange = () => {
      const root = surfaceRef.current;
      if (!root) return;
      const result = readSelection(root);
      if (!result) {
        setSelection(null);
        setMenu((current) => (activeHighlight ? current : null));
        return;
      }
      setActiveHighlight(null);
      setSelection(result);
      setMenu(positionFromRect(result.rect));
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [activeHighlight]);

  const dismissMenu = useCallback(() => {
    setMenu(null);
    setSelection(null);
    setActiveHighlight(null);
    clearSelection();
  }, []);

  const onSurfaceClick = () => {
    if (menu) {
      dismissMenu();
      return;
    }
    setChromeVisible(true);
  };

  /* ---------- highlight actions ---------- */
  const addHighlight = (color: HighlightColor) => {
    if (activeHighlight) {
      setHighlights((current) =>
        current.map((item) => (item.id === activeHighlight.id ? { ...item, color } : item)),
      );
      dismissMenu();
      return;
    }
    if (!selection) return;
    const created: Highlight[] = selection.parts.map((part, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      chapterId: part.chapterId,
      paragraphId: part.paragraphId,
      start: part.start,
      end: part.end,
      text: part.text.trim(),
      color,
      createdAt: Date.now(),
    }));
    setHighlights((current) => [...current, ...created]);
    dismissMenu();
    toast.success("تم التظليل");
  };

  const deleteHighlight = (id: string) => {
    setHighlights((current) => current.filter((item) => item.id !== id));
    dismissMenu();
  };

  const openNote = (highlight: Highlight) => {
    setNoteTarget(highlight);
    setNoteDraft(highlight.note ?? "");
    setMenu(null);
  };

  const startNoteFromSelection = () => {
    if (activeHighlight) {
      openNote(activeHighlight);
      return;
    }
    if (!selection) return;
    const part = selection.parts[0];
    if (!part) return;
    const created: Highlight = {
      id: `${Date.now()}-note-${Math.random().toString(36).slice(2, 7)}`,
      chapterId: part.chapterId,
      paragraphId: part.paragraphId,
      start: part.start,
      end: selection.parts[selection.parts.length - 1]?.end ?? part.end,
      text: selection.text,
      color: "yellow",
      createdAt: Date.now(),
    };
    setHighlights((current) => [...current, created]);
    clearSelection();
    setSelection(null);
    openNote(created);
  };

  const saveNote = () => {
    if (!noteTarget) return;
    const note = noteDraft.trim();
    setHighlights((current) =>
      current.map((item) => {
        if (item.id !== noteTarget.id) return item;
        const { note: _omit, ...rest } = item;
        return note ? { ...rest, note } : rest;
      }),
    );
    setNoteTarget(null);
    setNoteDraft("");
    toast.success("تم حفظ الملاحظة");
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("تم النسخ");
    } catch {
      toast.error("تعذّر النسخ");
    }
    dismissMenu();
  };

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    element.animate(
      [{ opacity: 0.35 }, { opacity: 1 }],
      { duration: 900, easing: "ease-out" },
    );
  };

  const menuText = activeHighlight?.text ?? selection?.text ?? "";

  return (
    <main
      className={`paper-${settings.theme} min-h-screen bg-paper`}
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div onClick={onSurfaceClick}>
        <ReaderSurface
          ref={surfaceRef}
          book={book}
          settings={settings}
          highlights={highlights}
          onHighlightClick={(highlight, rect) => {
            clearSelection();
            setSelection(null);
            setActiveHighlight(highlight);
            setMenu({ ...positionFromRect(rect), existingId: highlight.id });
          }}
        />
      </div>

      {/* تدرّج أسفل الشاشة يذوّب النص تحت شريط الأدوات */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-40"
        style={{
          background:
            "linear-gradient(to top, var(--paper) 18%, color-mix(in oklab, var(--paper) 78%, transparent) 55%, transparent 100%)",
        }}
      />



      <ReaderToolbar
        visible={chromeVisible && !menu && noteTarget === null && quoteText === null}
        page={page}
        totalPages={totalPages}
        percent={percent}
        onToc={() => setTocOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onDisplay={() => setDisplayOpen(true)}
        onHighlights={() => setHighlightsOpen(true)}
        onHide={() => setChromeVisible(false)}
      />

      {menu ? (
        <SelectionMenu
          state={menu}
          onHighlight={addHighlight}
          onNote={startNoteFromSelection}
          onQuote={() => {
            setQuoteText(menuText);
            setMenu(null);
          }}
          onCopy={() => void copyText(menuText)}
          {...(activeHighlight
            ? { onDelete: () => deleteHighlight(activeHighlight.id) }
            : {})}
        />
      ) : null}

      <TocSheet
        open={tocOpen}
        onOpenChange={setTocOpen}
        book={book}
        activeChapterId={activeChapterId}
        onSelect={(chapterId) => {
          setTocOpen(false);
          setTimeout(() => scrollToElement(chapterId), 180);
        }}
      />

      <SearchSheet
        open={searchOpen}
        onOpenChange={setSearchOpen}
        book={book}
        onSelect={(paragraphId) => {
          setSearchOpen(false);
          setTimeout(() => scrollToElement(paragraphId), 180);
        }}
      />

      <DisplaySettingsSheet
        open={displayOpen}
        onOpenChange={setDisplayOpen}
        settings={settings}
        onChange={setSettings}
      />

      <HighlightsSheet
        open={highlightsOpen}
        onOpenChange={setHighlightsOpen}
        book={book}
        highlights={highlights}
        onGoTo={(highlight) => {
          setHighlightsOpen(false);
          setTimeout(() => scrollToElement(highlight.paragraphId), 180);
        }}
        onDelete={deleteHighlight}
        onNote={(highlight) => {
          setHighlightsOpen(false);
          openNote(highlight);
        }}
        onShare={(highlight) => {
          setHighlightsOpen(false);
          setQuoteText(highlight.text);
        }}
      />

      <QuoteCard
        open={quoteText !== null}
        onOpenChange={(open) => {
          if (!open) setQuoteText(null);
        }}
        text={quoteText ?? ""}
        bookTitle={book.title}
        author={book.author}
      />

      <Dialog
        open={noteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setNoteTarget(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="rounded-3xl border border-panel-rule bg-panel text-panel-ink sm:max-w-md"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-panel-ink">ملاحظة</DialogTitle>
          </DialogHeader>
          <p className="rounded-xl bg-panel-rule p-3 font-reading text-sm leading-7">
            {noteTarget?.text}
          </p>
          <Textarea
            autoFocus
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="اكتب ملاحظتك…"
            className="min-h-28 border-panel-rule bg-panel-rule text-panel-ink placeholder:text-panel-ink/50"
          />
          <button
            onClick={saveNote}
            className="rounded-full bg-panel-ink py-3 text-sm font-medium text-panel"
          >
            حفظ
          </button>
        </DialogContent>
      </Dialog>
    </main>
  );
}

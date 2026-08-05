import { forwardRef } from "react";
import type { Book } from "@/data/sample-book";
import type { Highlight, ReaderSettings } from "@/lib/reader-storage";
import { segmentParagraph, highlightColorClass } from "@/lib/reader-selection";

interface Props {
  book: Book;
  settings: ReaderSettings;
  highlights: Highlight[];
  onHighlightClick: (highlight: Highlight, rect: DOMRect) => void;
}

export const ReaderSurface = forwardRef<HTMLDivElement, Props>(function ReaderSurface(
  { book, settings, highlights, onHighlightClick },
  ref,
) {
  return (
    <div
      ref={ref}
      dir="rtl"
      className="mx-auto px-6 pt-16 pb-40 select-text"
      style={{
        maxWidth: settings.width,
        fontSize: settings.fontSize,
        lineHeight: settings.lineHeight,
      }}
    >
      <header className="pb-12 text-center">
        <h1 className="font-reading text-3xl leading-relaxed text-ink">{book.title}</h1>
        <p className="pt-2 font-ui text-sm text-ink-soft">{book.author}</p>
      </header>

      {book.chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="pb-10">
          <h2
            className="pb-6 font-ui font-semibold text-ink"
            style={{ fontSize: settings.fontSize * 0.9 }}
          >
            {chapter.title}
          </h2>
          {chapter.paragraphs.map((paragraph) => {
            const paragraphHighlights = highlights.filter(
              (highlight) => highlight.paragraphId === paragraph.id,
            );
            return (
              <p
                key={paragraph.id}
                id={paragraph.id}
                data-pid={paragraph.id}
                data-cid={chapter.id}
                className="pb-6 text-justify font-reading text-ink transition-colors"
              >
                {segmentParagraph(paragraph.text, paragraphHighlights).map((segment, index) =>
                  segment.highlight ? (
                    <mark
                      key={index}
                      onClick={(event) => {
                        const rect = (
                          event.currentTarget as HTMLElement
                        ).getBoundingClientRect();
                        onHighlightClick(segment.highlight!, rect);
                      }}
                      className={`cursor-pointer rounded-[3px] text-inherit ${
                        highlightColorClass[segment.highlight.color]
                      } ${segment.highlight.note ? "border-b-2 border-dotted border-ink-soft" : ""}`}
                    >
                      {segment.text}
                    </mark>
                  ) : (
                    <span key={index}>{segment.text}</span>
                  ),
                )}
              </p>
            );
          })}
        </section>
      ))}

      <footer className="pt-4 pb-10 text-center font-ui text-xs text-ink-soft">
        نهاية النص التجريبي
      </footer>
    </div>
  );
});

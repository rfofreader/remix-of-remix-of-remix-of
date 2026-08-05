import { forwardRef } from "react";
import type { Book } from "@/lib/book-content";
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
      className="reader-surface mx-auto px-6 pt-16 pb-40 select-text"
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
          {book.chapters.length > 1 ? (
            <p className="pb-6 text-center font-ui text-xs tracking-wide text-ink-soft">
              {chapter.title}
            </p>
          ) : null}
          {chapter.paragraphs.map((paragraph) => {
            if (paragraph.level) {
              const size =
                paragraph.level === 1 ? 1.15 : paragraph.level === 2 ? 1 : 0.9;
              return (
                <p
                  key={paragraph.id}
                  id={paragraph.id}
                  data-pid={paragraph.id}
                  data-cid={chapter.id}
                  className={`font-reading font-semibold text-ink ${
                    paragraph.level === 1 ? "pt-6 pb-5" : "pt-3 pb-3"
                  }`}
                  style={{ fontSize: settings.fontSize * size }}
                >
                  {paragraph.text}
                </p>
              );
            }
            const paragraphHighlights = highlights.filter(
              (highlight) => highlight.paragraphId === paragraph.id,
            );
            return (
              <p
                key={paragraph.id}
                id={paragraph.id}
                data-pid={paragraph.id}
                data-cid={chapter.id}
                className="pb-6 text-justify font-quran text-ink transition-colors"
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
    </div>
  );
});

export interface CoverBook {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
}

/** غلاف الكتاب: صورة إن وُجدت، وإلا غلاف بلون التمييز يحمل العنوان والمؤلف فقط. */
export function BookCover({ book, className = "" }: { book: CoverBook; className?: string }) {
  if (book.cover_url) {
    return (
      <img
        src={book.cover_url}
        alt={`غلاف ${book.title}`}
        loading="lazy"
        className={`overflow-hidden rounded-[0.75rem] object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-col justify-end overflow-hidden rounded-[0.75rem] bg-panel p-3 text-panel-ink ${className}`}
    >
      <span className="line-clamp-4 text-right font-reading text-[12px] leading-5 font-semibold">
        {book.title}
      </span>
      <span className="pt-1 text-right text-[9px] opacity-70">{book.author}</span>
    </div>
  );
}

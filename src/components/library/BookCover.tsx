const covers = [
  "bg-panel text-panel-ink",
];

export interface CoverBook {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
}

/** غلاف الكتاب: صورة إن وُجدت، وإلا غلاف داكن مُولَّد من العنوان. */
export function BookCover({ book, className = "" }: { book: CoverBook; className?: string }) {
  if (book.cover_url) {
    return (
      <img
        src={book.cover_url}
        alt={`غلاف ${book.title}`}
        loading="lazy"
        className={`overflow-hidden rounded-[1.25rem] object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-col justify-between overflow-hidden rounded-[1.25rem] p-3 ${covers[0]} ${className}`}
    >
      <span className="line-clamp-3 text-right font-reading text-[12px] leading-5 font-medium">
        {book.title}
      </span>
      <span className="text-right text-[9px] opacity-70">{book.author}</span>
    </div>
  );
}

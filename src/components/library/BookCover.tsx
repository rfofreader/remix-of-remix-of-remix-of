export interface CoverBook {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
}

/* لوحة أغلفة رفوف: رملي، مريمية، طيني، فحمي */
const palettes = [
  { bg: "#E7DCC8", ink: "#3A3128", shape: "#C9B896" },
  { bg: "#C7D0BE", ink: "#2C332A", shape: "#A3B096" },
  { bg: "#C98A6B", ink: "#2E1D14", shape: "#E0B49B" },
  { bg: "#3A3A38", ink: "#EDE7DA", shape: "#575752" },
  { bg: "#EDE3D2", ink: "#2E241A", shape: "#D2C0A0" },
];

function hash(value: string) {
  let total = 0;
  for (const char of value) total = (total * 31 + char.charCodeAt(0)) % 100000;
  return total;
}

/** غلاف الكتاب: صورة إن وُجدت، وإلا غلاف هندسي مبسّط بأسلوب رفوف. */
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

  const seed = hash(book.id || book.title);
  const palette = palettes[seed % palettes.length]!;
  const variant = seed % 3;

  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden rounded-[0.75rem] p-3 ${className}`}
      style={{ backgroundColor: palette.bg, color: palette.ink }}
    >
      {variant === 0 ? (
        <span
          className="absolute left-1/2 top-[22%] size-[46%] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: palette.shape }}
        />
      ) : null}
      {variant === 1 ? (
        <span
          className="absolute inset-x-0 top-[30%] h-[26%]"
          style={{ backgroundColor: palette.shape }}
        />
      ) : null}
      {variant === 2 ? (
        <span
          className="absolute left-1/2 top-[20%] size-[46%] -translate-x-1/2 rotate-45"
          style={{ backgroundColor: palette.shape }}
        />
      ) : null}

      <span className="relative line-clamp-3 text-right font-reading text-[12px] leading-5 font-semibold">
        {book.title}
      </span>
      <span className="relative pt-1 text-right text-[9px] opacity-70">{book.author}</span>
    </div>
  );
}

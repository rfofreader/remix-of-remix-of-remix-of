import type { Book } from "@/data/sample-book";

const palettes = [
  "bg-[oklch(0.93_0.02_85)] text-[oklch(0.28_0.03_55)]",
  "bg-[oklch(0.88_0.05_150)] text-[oklch(0.26_0.04_150)]",
  "bg-[oklch(0.3_0.05_265)] text-[oklch(0.96_0.01_265)]",
  "bg-[oklch(0.9_0.06_30)] text-[oklch(0.3_0.06_30)]",
];

function hash(value: string) {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) total += value.charCodeAt(index);
  return total;
}

/** غلاف كتاب مُولَّد من العنوان (بدون صور). */
export function BookCover({ book, className = "" }: { book: Book; className?: string }) {
  const palette = palettes[hash(book.id) % palettes.length];
  return (
    <div
      className={`flex flex-col justify-between overflow-hidden rounded-xl p-2.5 shadow-[0_8px_18px_-10px_rgb(0_0_0/0.5)] ${palette} ${className}`}
    >
      <span className="font-reading text-[13px] leading-5 line-clamp-3">{book.title}</span>
      <span className="text-[9px] opacity-70">{book.author}</span>
    </div>
  );
}

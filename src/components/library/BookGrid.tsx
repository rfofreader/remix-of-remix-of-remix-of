import { Link } from "@tanstack/react-router";
import { BookCover } from "@/components/library/BookCover";
import type { BookWithCategory } from "@/lib/books-api";

interface Props {
  books: BookWithCategory[];
  /** إظهار سطر التصنيف تحت اسم المؤلف. */
  showCategory?: boolean;
}

/** شبكة كتب من ثلاثة أعمدة — نفس بطاقة الكتاب في كل الصفحات. */
export function BookGrid({ books, showCategory }: Props) {
  return (
    <ul className="mt-4 grid grid-cols-3 gap-4">
      {books.map((book) => (
        <li key={book.id}>
          <Link
            to="/book/$bookId"
            params={{ bookId: book.id }}
            className="block transition-opacity active:opacity-70"
          >
            <BookCover book={book} className="aspect-[3/4] w-full" />
            <p className="pt-2 line-clamp-2 text-right text-[11px] leading-4 font-medium text-ink">
              {book.title}
            </p>
            <p className="text-right text-[11px] leading-4 text-ink-soft">{book.author}</p>
            {showCategory && book.categories ? (
              <p className="text-right text-[11px] leading-4 text-ink-soft/80">
                {book.categories.name}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

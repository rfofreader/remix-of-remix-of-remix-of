interface Props {
  text: string;
  author: string;
}

/** بطاقة الاقتباس الداكنة أعلى الصفحة الرئيسية. */
export function QuoteBanner({ text, author }: Props) {
  return (
    <section className="mt-5 rounded-[1.75rem] bg-panel px-5 pt-4 pb-6 text-panel-ink">
      <span aria-hidden className="block text-right text-3xl leading-none font-bold">
        ”
      </span>
      <p className="px-2 text-center text-sm leading-7 font-medium">{text}</p>
      <p className="pt-3 text-center text-xs text-panel-ink/75">- {author}</p>
    </section>
  );
}

import { PopupPanel } from "@/components/reader/PopupPanel";
import type { Book, TocNode } from "@/lib/book-content";
import { buildToc } from "@/lib/book-content";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  activeChapterId: string;
  onSelect: (targetId: string) => void;
}

export function TocSheet({ open, onOpenChange, book, activeChapterId, onSelect }: Props) {
  const tree = buildToc(book);

  return (
    <PopupPanel
      open={open}
      onOpenChange={onOpenChange}
      title="المحتويات"
      subtitle={`${book.title} — ${book.author}`}
    >
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <TocItem
            key={node.id}
            node={node}
            activeId={activeChapterId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </PopupPanel>
  );
}

function TocItem({
  node,
  activeId,
  onSelect,
}: {
  node: TocNode;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const active = node.id === activeId;
  const indent = node.level * 14;
  return (
    <li>
      <button
        onClick={() => onSelect(node.id)}
        style={{ paddingInlineStart: 12 + indent }}
        className={`flex w-full items-center gap-2 rounded-lg py-2.5 pl-3 text-right transition-colors ${
          active ? "bg-panel-rule font-semibold" : "hover:bg-panel-rule"
        }`}
      >
        <span
          className={`flex-1 leading-6 ${
            node.level === 0
              ? "text-sm font-semibold"
              : node.level === 1
                ? "text-sm"
                : "text-[13px] text-panel-ink/75"
          }`}
        >
          {node.title}
        </span>
      </button>
      {node.children.length ? (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <TocItem key={child.id} node={child} activeId={activeId} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

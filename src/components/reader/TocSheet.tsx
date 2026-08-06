import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
  /* الفصول مطويّة افتراضياً */
  const [expanded, setExpanded] = useState(false);
  const active = node.id === activeId;
  const indent = node.level * 14;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        style={{ paddingInlineStart: 12 + indent }}
        className={`flex w-full items-center gap-1 rounded-lg transition-colors ${
          active ? "bg-panel-rule font-semibold" : "hover:bg-panel-rule"
        }`}
      >
        <button
          onClick={() => onSelect(node.id)}
          className="flex-1 py-2.5 pl-2 text-right"
        >
          <span
            className={`block leading-6 ${
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
        {hasChildren ? (
          <button
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? "طيّ" : "توسيع"}
            aria-expanded={expanded}
            className="ml-2 rounded-full p-1.5 text-panel-ink/60 transition-colors hover:bg-panel-ink/10"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : null}
      </div>
      {hasChildren && expanded ? (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <TocItem key={child.id} node={child} activeId={activeId} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

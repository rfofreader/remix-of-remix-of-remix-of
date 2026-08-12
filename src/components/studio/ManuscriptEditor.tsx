import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle, FontFamily, Color } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Maximize2,
  Minus,
  Outdent,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Replace,
  Strikethrough,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#8a5a2b", "#1f4f6b", "#6b1f2e", "#2f5d3a", "#4a3f6b", "#333333"];
const HIGHLIGHTS = ["#fdf0b5", "#ffd9d0", "#d6ecd8", "#d5e6f5", "#ece0f7"];
const ARABIC_PUNCT = ["،", "؛", "؟", "«", "»", "٪", "…", "ـ", "ﷺ", "﴿", "﴾"];

type GroupKey = "text" | "structure" | "lists" | "align" | "insert" | "tools";

export function ManuscriptEditor({
  content,
  placeholder = "ابدأ كتابة الفصل…",
  onUpdate,
}: {
  content: string;
  placeholder?: string;
  onUpdate?: (html: string) => void;
}) {
  const [openGroup, setOpenGroup] = useState<GroupKey | null>("text");
  const [focusMode, setFocusMode] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [words, setWords] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontFamily,
      Color,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content,
    editorProps: { attributes: { class: "manuscript min-h-[45vh] outline-none", dir: "rtl" } },
    onUpdate: ({ editor: instance }) => {
      setWords(instance.storage["characterCount"].words());
      onUpdate?.(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) editor.commands.setContent(content, { emitUpdate: false });
    setWords(editor.storage["characterCount"].words());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-dash-border bg-dash-surface p-6 text-sm text-dash-muted">
        جارٍ تحضير المحرر…
      </div>
    );
  }

  const runFindReplace = () => {
    if (!find) return;
    const html = editor.getHTML().split(find).join(replace);
    editor.commands.setContent(html);
    onUpdate?.(html);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-dash-border bg-dash-surface text-dash-fg",
        focusMode && "fixed inset-0 z-50 overflow-y-auto rounded-none",
      )}
    >
      <div className="sticky top-0 z-10 border-b border-dash-border bg-dash-surface/95 backdrop-blur">
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5">
          <TB onClick={() => editor.chain().focus().undo().run()} label="تراجع"><Undo2 className="size-4" /></TB>
          <TB onClick={() => editor.chain().focus().redo().run()} label="إعادة"><Redo2 className="size-4" /></TB>
          <Sep />
          <TB active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="عريض"><Bold className="size-4" /></TB>
          <TB active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="مائل"><Italic className="size-4" /></TB>
          <TB active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} label="تحته خط"><UnderlineIcon className="size-4" /></TB>
          <TB active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} label="تظليل"><Highlighter className="size-4" /></TB>
          <Sep />
          <TB active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="عنوان">ع٢</TB>
          <TB active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="قائمة"><List className="size-4" /></TB>
          <Sep />
          <TB onClick={() => setFocusMode((value) => !value)} label="وضع التركيز"><Maximize2 className="size-4" /></TB>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-t border-dash-border px-2 py-1.5 text-[0.75rem]">
          {(
            [
              ["text", "نمط النص"],
              ["structure", "البنية"],
              ["lists", "القوائم"],
              ["align", "المحاذاة"],
              ["insert", "إدراج"],
              ["tools", "أدوات"],
            ] as Array<[GroupKey, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOpenGroup(openGroup === key ? null : key)}
              className={cn(
                "flex min-h-9 shrink-0 items-center gap-1 rounded-md px-2.5",
                openGroup === key ? "bg-dash-fg/10 font-medium" : "text-dash-muted",
              )}
            >
              {label}
              <ChevronDown className={cn("size-3 transition-transform", openGroup === key && "rotate-180")} />
            </button>
          ))}
        </div>

        {openGroup ? (
          <div className="flex flex-wrap items-center gap-1 border-t border-dash-border bg-dash-bg px-2 py-2">
            {openGroup === "text" ? (
              <>
                <TB active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="يتوسطه خط"><Strikethrough className="size-4" /></TB>
                <TB active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} label="شفرة"><Code className="size-4" /></TB>
                <TB active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} label="مرتفع"><SupIcon className="size-4" /></TB>
                <TB active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} label="منخفض"><SubIcon className="size-4" /></TB>
                <Sep />
                <span className="px-1 text-dash-muted"><Palette className="size-4" /></span>
                {COLORS.map((color) => (
                  <Swatch key={color} color={color} label={`لون ${color}`} onClick={() => editor.chain().focus().setColor(color).run()} />
                ))}
                <Sep />
                {HIGHLIGHTS.map((color) => (
                  <Swatch key={color} color={color} label={`تظليل ${color}`} onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} />
                ))}
                <Sep />
                <TB onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} label="مسح التنسيق"><Eraser className="size-4" /></TB>
              </>
            ) : null}

            {openGroup === "structure" ? (
              <>
                {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                  <TB
                    key={level}
                    active={editor.isActive("heading", { level })}
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                    label={`عنوان ${level}`}
                  >
                    ع{level}
                  </TB>
                ))}
                <TB active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} label="فقرة"><Pilcrow className="size-4" /></TB>
                <TB active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="اقتباس"><Quote className="size-4" /></TB>
                <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} label="فاصل"><Minus className="size-4" /></TB>
              </>
            ) : null}

            {openGroup === "lists" ? (
              <>
                <TB active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="نقطية"><List className="size-4" /></TB>
                <TB active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="مرقّمة"><ListOrdered className="size-4" /></TB>
                <TB active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} label="مهام"><ListTodo className="size-4" /></TB>
                <TB onClick={() => editor.chain().focus().sinkListItem("listItem").run()} label="زيادة الإزاحة"><Indent className="size-4" /></TB>
                <TB onClick={() => editor.chain().focus().liftListItem("listItem").run()} label="تقليل الإزاحة"><Outdent className="size-4" /></TB>
              </>
            ) : null}

            {openGroup === "align" ? (
              <>
                <TB active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} label="يمين"><AlignRight className="size-4" /></TB>
                <TB active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} label="وسط"><AlignCenter className="size-4" /></TB>
                <TB active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} label="يسار"><AlignLeft className="size-4" /></TB>
                <TB active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} label="ضبط"><AlignJustify className="size-4" /></TB>
              </>
            ) : null}

            {openGroup === "insert" ? (
              <>
                <TB
                  onClick={() => {
                    const url = window.prompt("رابط:");
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                  }}
                  label="رابط"
                >
                  <Link2 className="size-4" />
                </TB>
                <TB
                  onClick={() => {
                    const url = window.prompt("رابط الصورة:");
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                  }}
                  label="صورة"
                >
                  <ImageIcon className="size-4" />
                </TB>
                <Sep />
                {ARABIC_PUNCT.map((char) => (
                  <TB key={char} onClick={() => editor.chain().focus().insertContent(char).run()} label={`إدراج ${char}`}>
                    {char}
                  </TB>
                ))}
              </>
            ) : null}

            {openGroup === "tools" ? (
              <>
                <TB onClick={() => setFindOpen((value) => !value)} label="بحث واستبدال"><Replace className="size-4" /></TB>
                <TB onClick={() => editor.chain().focus().clearNodes().run()} label="تنظيف العقد"><Eraser className="size-4" /></TB>
              </>
            ) : null}
          </div>
        ) : null}

        {findOpen ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-dash-border bg-dash-bg px-3 py-2">
            <input
              value={find}
              onChange={(event) => setFind(event.target.value)}
              placeholder="ابحث"
              className="min-h-9 flex-1 rounded-md border border-dash-border bg-dash-surface px-2 text-[0.8125rem] outline-none"
            />
            <input
              value={replace}
              onChange={(event) => setReplace(event.target.value)}
              placeholder="استبدل بـ"
              className="min-h-9 flex-1 rounded-md border border-dash-border bg-dash-surface px-2 text-[0.8125rem] outline-none"
            />
            <button onClick={runFindReplace} className="min-h-9 rounded-md bg-dash-fg px-3 text-[0.75rem] text-dash-surface">
              استبدال الكل
            </button>
          </div>
        ) : null}
      </div>

      <BubbleMenu editor={editor} className="flex items-center gap-1 rounded-md border border-dash-border bg-dash-surface p-1">
        <TB active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="عريض"><Bold className="size-4" /></TB>
        <TB active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="مائل"><Italic className="size-4" /></TB>
        <TB active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} label="تظليل"><Highlighter className="size-4" /></TB>
      </BubbleMenu>

      <div className="px-4 py-5 sm:px-8">
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between border-t border-dash-border px-4 py-2 text-[0.7rem] text-dash-muted">
        <span>محرّر المخطوطة</span>
        <span>{words} كلمة</span>
      </div>
    </div>
  );
}

function TB({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "grid min-h-9 min-w-9 shrink-0 place-items-center rounded-md px-2 text-[0.75rem] transition-colors",
        active ? "bg-dash-fg/10 text-dash-fg" : "text-dash-muted hover:bg-dash-fg/5",
      )}
    >
      {children}
    </button>
  );
}

function Swatch({ color, onClick, label }: { color: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="size-6 shrink-0 rounded-sm border border-dash-border"
      style={{ background: color }}
    />
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-dash-border" />;
}

export type { Editor };

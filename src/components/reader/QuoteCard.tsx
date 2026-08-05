import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  bookTitle: string;
  author: string;
}

export function QuoteCard({ open, onOpenChange, text, bookTitle, author }: Props) {
  const [shape, setShape] = useState<"wide" | "square">("wide");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`«${text}»\n— ${author}، ${bookTitle}`);
      toast.success("تم نسخ الاقتباس");
    } catch {
      toast.error("تعذّر النسخ");
    }
  };

  const share = async () => {
    const payload = { title: bookTitle, text: `«${text}»\n— ${author}، ${bookTitle}` };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* user dismissed */
      }
    }
    void copy();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-[92vw] rounded-3xl border-rule bg-panel text-panel-ink font-ui sm:max-w-lg"
      >
        <DialogHeader className="text-right">
          <DialogTitle className="font-ui text-panel-ink">بطاقة اقتباس</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <div
            className={`flex w-full flex-col justify-between rounded-2xl bg-paper p-6 shadow-sm ${
              shape === "square" ? "aspect-square" : "aspect-[4/3]"
            }`}
          >
            <p className="border-r-4 border-chrome pr-4 font-reading text-lg leading-9 text-ink">
              {text}
            </p>
            <div className="pt-5 text-right">
              <p className="text-sm font-semibold text-ink">{bookTitle}</p>
              <p className="text-xs text-ink-soft">{author}</p>
            </div>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-1 rounded-full bg-rule/50 p-1 text-sm">
          {(["wide", "square"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setShape(option)}
              className={`rounded-full py-2 transition-colors ${
                shape === option ? "bg-panel font-semibold shadow-sm" : "text-ink-soft"
              }`}
            >
              {option === "wide" ? "عريضة" : "مربعة"}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={share}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-chrome py-3 text-sm font-medium text-chrome-ink"
          >
            <Share2 className="size-4" /> مشاركة
          </button>
          <button
            onClick={copy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rule py-3 text-sm font-medium"
          >
            <Copy className="size-4" /> نسخ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

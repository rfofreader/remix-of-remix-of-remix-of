import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/** ارتفاع المساحة المرئية فعلياً (يتقلّص عند ظهور لوحة المفاتيح). */
function useViewportHeight() {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => setHeight(viewport.height);
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);
  return height;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}

/** بطاقة منبثقة في وسط الشاشة تُستخدم لكل لوحات القارئ. */
export function PopupPanel({ open, onOpenChange, title, subtitle, children }: Props) {
  const viewportHeight = useViewportHeight();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir="rtl"
          style={
            viewportHeight
              ? { top: viewportHeight / 2, maxHeight: viewportHeight - 32 }
              : undefined
          }
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[76vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-panel-rule bg-panel font-ui text-panel-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)] duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0"
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
            <div className="text-right">
              <DialogPrimitive.Title className="font-ui text-base font-semibold text-panel-ink">
                {title}
              </DialogPrimitive.Title>
              {subtitle ? (
                <p className="pt-1 text-xs text-panel-ink/55">{subtitle}</p>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="إغلاق"
              className="-mt-1 rounded-full p-1.5 text-panel-ink/50 transition-colors hover:bg-panel-rule hover:text-panel-ink"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

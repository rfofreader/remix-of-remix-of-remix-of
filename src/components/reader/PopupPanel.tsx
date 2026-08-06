import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

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

/** بطاقة سفلية (Bottom Sheet) تُغلق بالسحب للأسفل — بدون زر إغلاق. */
export function PopupPanel({ open, onOpenChange, title, subtitle, children }: Props) {
  const viewportHeight = useViewportHeight();
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) setDrag(0);
  }, [open]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    setDrag(Math.max(0, event.clientY - startY.current));
  };

  const onPointerUp = () => {
    if (startY.current === null) return;
    startY.current = null;
    setDrag((value) => {
      if (value > 110) onOpenChange(false);
      return 0;
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir="rtl"
          style={{
            maxHeight: viewportHeight ? viewportHeight - 24 : undefined,
            transform: `translateY(${drag}px)`,
            transition: startY.current === null ? "transform 200ms ease-out" : "none",
          }}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-panel-rule border-b-0 bg-panel font-ui text-panel-ink shadow-[0_-16px_50px_-12px_rgb(0_0_0/0.45)] duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
        >
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="cursor-grab touch-none px-5 pt-3 pb-3 active:cursor-grabbing"
          >
            <div
              aria-hidden
              className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-panel-ink/20"
            />
            <div className="text-right">
              <DialogPrimitive.Title className="font-ui text-base font-semibold text-panel-ink">
                {title}
              </DialogPrimitive.Title>
              {subtitle ? (
                <p className="pt-1 text-xs text-panel-ink/55">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

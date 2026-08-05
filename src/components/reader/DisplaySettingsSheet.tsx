import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import type { ReaderSettings, ReaderTheme } from "@/lib/reader-storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
}

const themes: { id: ReaderTheme; label: string; swatch: string }[] = [
  { id: "light", label: "فاتح", swatch: "bg-white" },
  { id: "sepia", label: "سيبيا", swatch: "bg-[oklch(0.955_0.018_85)]" },
  { id: "dark", label: "داكن", swatch: "bg-[oklch(0.2213_0_0)]" },
];

export function DisplaySettingsSheet({ open, onOpenChange, settings, onChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir="rtl"
        hideClose
        overlayClassName="bg-transparent"
        className="max-h-[70vh] overflow-y-auto inset-x-3 bottom-24 rounded-3xl border border-panel-rule bg-panel p-5 text-panel-ink font-ui shadow-2xl"
      >
        <SheetHeader className="text-right">
          <SheetTitle className="font-ui text-panel-ink">العرض والمظهر</SheetTitle>
        </SheetHeader>

        <div className="space-y-7 pt-2 pb-8">
          <div>
            <p className="pb-3 text-sm text-panel-ink/60">الوضع</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onChange({ ...settings, theme: theme.id })}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 transition-colors ${
                    settings.theme === theme.id
                      ? "border-panel-ink bg-panel-rule"
                      : "border-panel-rule hover:bg-panel-rule"
                  }`}
                >
                  <span
                    className={`size-8 rounded-full border border-panel-rule ${theme.swatch}`}
                  />
                  <span className="text-sm">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between pb-3 text-sm">
              <span className="text-panel-ink/60">حجم الخط</span>
              <span className="text-panel-ink/60">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              min={16}
              max={30}
              step={1}
              onValueChange={([value]) =>
                onChange({ ...settings, fontSize: value ?? settings.fontSize })
              }
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between pb-3 text-sm">
              <span className="text-panel-ink/60">تباعد الأسطر</span>
              <span className="text-panel-ink/60">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.lineHeight]}
              min={1.6}
              max={2.6}
              step={0.1}
              onValueChange={([value]) =>
                onChange({ ...settings, lineHeight: value ?? settings.lineHeight })
              }
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between pb-3 text-sm">
              <span className="text-panel-ink/60">عرض العمود</span>
              <span className="text-panel-ink/60">{settings.width}px</span>
            </div>
            <Slider
              value={[settings.width]}
              min={420}
              max={860}
              step={20}
              onValueChange={([value]) =>
                onChange({ ...settings, width: value ?? settings.width })
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

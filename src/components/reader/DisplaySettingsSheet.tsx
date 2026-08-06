import { PopupPanel } from "@/components/reader/PopupPanel";
import { Slider } from "@/components/ui/slider";
import {
  fontStack,
  readerFonts,
  type ReaderSettings,
  type ReaderTheme,
} from "@/lib/reader-storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
}

const themes: { id: ReaderTheme; label: string; swatch: string }[] = [
  { id: "light", label: "فاتح", swatch: "bg-white" },
  { id: "sepia", label: "سيبيا", swatch: "bg-[oklch(0.955_0.018_85)]" },
  { id: "dark", label: "داكن", swatch: "bg-[oklch(0.207_0_0)]" },
];


export function DisplaySettingsSheet({ open, onOpenChange, settings, onChange }: Props) {
  return (
    <PopupPanel open={open} onOpenChange={onOpenChange} title="العرض والمظهر">
      <div className="space-y-7 pt-1">
        <div>
          <p className="pb-3 text-sm text-panel-ink/55">الوضع</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onChange({ ...settings, theme: theme.id })}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 transition-colors ${
                  settings.theme === theme.id
                    ? "border-panel-ink/60 bg-panel-rule"
                    : "border-panel-rule hover:bg-panel-rule"
                }`}
              >
                <span className={`size-8 rounded-full border border-panel-rule ${theme.swatch}`} />
                <span className="text-sm">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between pb-3 text-sm">
            <span className="text-panel-ink/55">نوع الخط</span>
            <button
              onClick={() => onChange({ ...settings, bold: !settings.bold })}
              aria-label="خط عريض"
              aria-pressed={settings.bold}
              className={`size-8 rounded-full border text-sm font-bold transition-colors ${
                settings.bold
                  ? "border-panel-ink/60 bg-panel-ink text-panel"
                  : "border-panel-rule text-panel-ink/70"
              }`}
            >
              B
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {readerFonts.map((font) => (
              <button
                key={font.id}
                onClick={() => onChange({ ...settings, font: font.id })}
                style={{ fontFamily: fontStack(font.id) }}
                className={`rounded-2xl border px-3 py-3 text-sm transition-colors ${
                  settings.font === font.id
                    ? "border-panel-ink/60 bg-panel-rule"
                    : "border-panel-rule hover:bg-panel-rule"
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>


        <div>
          <div className="flex items-baseline justify-between pb-3 text-sm">
            <span className="text-panel-ink/55">حجم الخط</span>
            <span className="text-panel-ink/55 tabular-nums">{settings.fontSize}px</span>
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
            <span className="text-panel-ink/55">تباعد الأسطر</span>
            <span className="text-panel-ink/55 tabular-nums">
              {settings.lineHeight.toFixed(1)}
            </span>
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
            <span className="text-panel-ink/55">عرض العمود</span>
            <span className="text-panel-ink/55 tabular-nums">{settings.width}px</span>
          </div>
          <Slider
            value={[settings.width]}
            min={420}
            max={860}
            step={20}
            onValueChange={([value]) => onChange({ ...settings, width: value ?? settings.width })}
          />
        </div>
      </div>
    </PopupPanel>
  );
}

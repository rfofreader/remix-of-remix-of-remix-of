import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppPage } from "@/components/layout/AppPage";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — أثر الهدوء" },
      { name: "description", content: "سجّل الدخول لحفظ تقدّمك ومفضّلتك عبر أجهزتك." },
      { property: "og:title", content: "تسجيل الدخول — أثر الهدوء" },
      { property: "og:description", content: "حساب واحد لكل قراءاتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/account" });
  }, [loading, user, navigate]);

  const social = async (provider: "google" | "apple") => {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("تعذّر تسجيل الدخول");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/account" });
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("تحقّق من بريدك لتأكيد الحساب");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/account" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّرت العملية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppPage
      title={mode === "signin" ? "تسجيل الدخول" : "حساب جديد"}
      subtitle="احفظ تقدّمك ومفضّلتك في كل أجهزتك"
    >
      <div className="mt-6 space-y-2">
        <button
          onClick={() => void social("google")}
          className="w-full rounded-lg bg-panel py-3.5 text-sm font-medium text-ink shadow-sm"
        >
          المتابعة بحساب جوجل
        </button>
        <button
          onClick={() => void social("apple")}
          className="w-full rounded-lg bg-panel py-3.5 text-sm font-medium text-ink shadow-sm"
        >
          المتابعة بحساب آبل
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[11px] text-ink-soft">
        <span className="h-px flex-1 bg-rule" />
        أو بالبريد الإلكتروني
        <span className="h-px flex-1 bg-rule" />
      </div>

      <div className="space-y-2">
        {mode === "signup" ? (
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="الاسم"
            className="h-11 rounded-lg border-rule bg-panel text-ink"
          />
        ) : null}
        <Input
          type="email"
          dir="ltr"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="البريد الإلكتروني"
          className="h-11 rounded-lg border-rule bg-panel text-ink"
        />
        <Input
          type="password"
          dir="ltr"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="كلمة المرور"
          className="h-11 rounded-lg border-rule bg-panel text-ink"
        />
        <button
          onClick={() => void submit()}
          disabled={busy}
          className="w-full rounded-lg bg-brand py-3.5 text-sm font-medium text-brand-ink disabled:opacity-60"
        >
          {mode === "signin" ? "دخول" : "إنشاء الحساب"}
        </button>
      </div>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-center text-xs text-ink-soft underline"
      >
        {mode === "signin" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
      </button>
    </AppPage>
  );
}

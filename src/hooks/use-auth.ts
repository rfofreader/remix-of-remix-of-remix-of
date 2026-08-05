import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  displayName: string;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    let active = true;

    const load = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      if (!next?.user) {
        setIsAdmin(false);
        setDisplayName("");
        setLoading(false);
        return;
      }
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", next.user.id),
        supabase.from("profiles").select("display_name").eq("id", next.user.id).maybeSingle(),
      ]);
      if (!active) return;
      setIsAdmin((roles ?? []).some((row) => row.role === "admin"));
      setDisplayName(profile?.display_name ?? next.user.email?.split("@")[0] ?? "");
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void load(next);
    });
    void supabase.auth.getSession().then(({ data }) => load(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    session,
    user: session?.user ?? null,
    isAdmin,
    displayName,
  };
}

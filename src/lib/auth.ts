import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!active) return;
      setSession(s);
      setLoading(false);
    });

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, user: session?.user ?? null };
}

export async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [admin, setAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (loading) {
      setChecking(true);
      return () => {
        active = false;
      };
    }
    if (!user) {
      setAdmin(false);
      setChecking(false);
      return () => {
        active = false;
      };
    }

    setChecking(true);
    isAdmin(user.id)
      .then((r) => {
        if (!active) return;
        setAdmin(r);
      })
      .catch(() => {
        if (!active) return;
        setAdmin(false);
      })
      .finally(() => {
        if (!active) return;
        setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [user, loading]);

  return { isAdmin: admin, loading: loading || checking, user };
}

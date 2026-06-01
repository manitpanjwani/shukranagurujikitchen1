import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    isAdmin(user.id).then((ok) => {
      if (ok) nav({ to: "/admin", replace: true });
    });
  }, [authLoading, user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) return toast.error(error.message);
        toast.success("Account created. Ask the owner to promote you to admin, then sign in.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return toast.error(error.message);
      const ok = await isAdmin(data.user?.id);
      if (!ok) {
        await supabase.auth.signOut();
        return toast.error("Signed in, but this account is not an admin.");
      }
      nav({ to: "/admin", replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-card p-8">
        <div className="text-center mb-6">
          <div className="font-display text-3xl">
            Shukrana <span className="text-primary">Guruji</span>
          </div>
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mt-1">
            CMS Admin
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2.5 bg-background outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2.5 bg-background outline-none focus:border-primary"
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:bg-primary/90 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-xs text-muted-foreground hover:text-primary"
          >
            {mode === "login" ? "New here? Create account" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

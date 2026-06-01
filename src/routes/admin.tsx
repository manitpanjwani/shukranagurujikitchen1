import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  Ticket,
  HelpCircle,
  Inbox,
  LogOut,
  ImageIcon,
} from "lucide-react";
import { useIsAdmin } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import centerMark from "@/assets/center-mark.png";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/items", label: "Menu items", icon: UtensilsCrossed },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/offers", label: "Offers", icon: Ticket },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
];

function AdminLayout() {
  const { isAdmin, loading, user } = useIsAdmin();
  const nav = useNavigate();
  const path = useLocation({ select: (location) => location.pathname });
  const isLoginRoute = path === "/admin/login";

  useEffect(() => {
    if (loading || isLoginRoute) return;
    if (!user || !isAdmin) nav({ to: "/admin/login" });
  }, [loading, user, isAdmin, nav, isLoginRoute]);

  // Login page renders without the admin shell / gate
  if (isLoginRoute) return <Outlet />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!user || !isAdmin) return null;


  return (
    <div className="min-h-screen flex bg-secondary/40">
      <aside className="w-64 bg-foreground text-background flex flex-col">
        <div className="p-6 border-b border-background/10 flex items-center gap-3">
          <img src={centerMark} alt="" className="size-10 object-contain" />
          <div>
            <div className="font-display text-xl">
              Shukrana <span className="text-primary italic">Guruji</span>
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-70">CMS</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-background/10",
                )}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-background/10">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              nav({ to: "/admin/login" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-background/10"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

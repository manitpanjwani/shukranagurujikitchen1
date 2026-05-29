import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed, Tag, Ticket, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-soft">
      <Icon className="size-6 text-primary" />
      <div className="text-3xl font-display mt-3">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Dashboard() {
  const { data: counts } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [items, cats, offers, msgs] = await Promise.all([
        supabase.from("menu_items").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      ]);
      return {
        items: items.count ?? 0,
        cats: cats.count ?? 0,
        offers: offers.count ?? 0,
        msgs: msgs.count ?? 0,
      };
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Welcome back. Here's what's on the menu today.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard icon={UtensilsCrossed} label="Menu items" value={counts?.items ?? "—"} />
        <StatCard icon={Tag} label="Categories" value={counts?.cats ?? "—"} />
        <StatCard icon={Ticket} label="Active offers" value={counts?.offers ?? "—"} />
        <StatCard icon={Inbox} label="Messages" value={counts?.msgs ?? "—"} />
      </div>
    </div>
  );
}

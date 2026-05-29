import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ItemCard } from "@/components/site/ItemCard";
import { supabase } from "@/integrations/supabase/client";
import type { Category, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Shukrana Guruji Kitchen" },
      { name: "description", content: "Browse our full menu — thalis, biryani, Chinese, rolls, snacks, beverages, and desserts. Fresh daily." },
    ],
  }),
  component: MenuPage,
});

type Filter = "all" | "veg" | "non-veg" | "bestseller";

function MenuPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data as Category[];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("sort_order");
      return data as MenuItem[];
    },
  });

  // Honour #slug from URL
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h) {
      setActiveCat(h);
      setTimeout(() => {
        document.getElementById(`cat-${h}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [cats]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => {
      if (filter === "veg" && !i.is_veg) return false;
      if (filter === "non-veg" && i.is_veg) return false;
      if (filter === "bestseller" && !i.is_bestseller) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!i.name.toLowerCase().includes(q) && !(i.description?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [items, filter, search]);

  return (
    <SiteLayout>
      <div className="container-wide pt-12 pb-20">
        <div className="sticky top-20 z-20 -mx-5 px-5 py-4 bg-background/90 backdrop-blur-md border-b border-border/50 mb-10">
          <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2.5 shadow-soft">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for biryani, paneer, rolls..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <div className="hidden md:flex gap-2">
              {(["all", "veg", "non-veg", "bestseller"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "text-xs uppercase tracking-wider px-4 py-1.5 rounded-full border transition",
                    filter === f
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {f === "all" ? "All" : f === "veg" ? "Veg" : f === "non-veg" ? "Non-veg" : "Bestseller"}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-1">
            {(["all", "veg", "non-veg", "bestseller"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 text-xs uppercase tracking-wider px-4 py-1.5 rounded-full border",
                  filter === f
                    ? "bg-foreground text-background border-foreground"
                    : "border-border",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {cats && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {cats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCat(c.slug);
                    document.getElementById(`cat-${c.slug}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={cn(
                    "shrink-0 text-xs font-medium px-4 py-1.5 rounded-full border transition flex items-center gap-1.5",
                    activeCat === c.slug
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <span>{c.icon}</span> {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-12 text-center">
          <h1 className="font-display text-5xl">Our Full Menu</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {items?.length ?? 0} dishes · Fresh daily
          </p>
        </div>

        <div className="space-y-16">
          {cats?.map((cat) => {
            const list = filtered.filter((i) => i.category_id === cat.id);
            if (list.length === 0) return null;
            return (
              <section key={cat.id} id={`cat-${cat.slug}`}>
                <div className="flex items-baseline gap-3 mb-6 border-b border-border pb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="font-display text-3xl">{cat.name}</h2>
                  <span className="text-sm text-muted-foreground">· {list.length}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {list.map((i) => <ItemCard key={i.id} item={i} />)}
                </div>
              </section>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-20">
              No dishes matched your search.
            </p>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

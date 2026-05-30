import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Leaf, ArrowUpDown, Star, IndianRupee, Beef } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ItemCard } from "@/components/site/ItemCard";
import { supabase } from "@/integrations/supabase/client";
import type { Category, MenuItem } from "@/lib/types";
import { useVegMode } from "@/lib/veg";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Shukrana Guruji Kitchen" },
      { name: "description", content: "Browse our full menu — thalis, biryani, Chinese, rolls, snacks, and more. Fresh daily." },
    ],
  }),
  component: MenuPage,
});

type SortKey = "" | "price_asc" | "price_desc";
type RatingKey = "" | "3.5" | "4.0";
type DietKey = "" | "veg" | "nonveg";
type PriceKey = "" | "lt100" | "lt250" | "gt350";

type Filters = {
  sort: SortKey;
  rating: RatingKey;
  diet: DietKey;
  price: PriceKey;
};

const EMPTY: Filters = { sort: "", rating: "", diet: "", price: "" };

function MenuPage() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [veg] = useVegMode();

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
    let list = items.slice();

    // Home VEG toggle overrides menu diet filter
    if (veg) list = list.filter((i) => i.is_veg);
    else if (filters.diet === "veg") list = list.filter((i) => i.is_veg);
    else if (filters.diet === "nonveg") list = list.filter((i) => !i.is_veg);

    if (filters.rating === "3.5") list = list.filter((i) => Number(i.rating) >= 3.5);
    if (filters.rating === "4.0") list = list.filter((i) => Number(i.rating) >= 4.0);

    if (filters.price === "lt100") list = list.filter((i) => Number(i.price) < 100);
    if (filters.price === "lt250") list = list.filter((i) => Number(i.price) < 250);
    if (filters.price === "gt350") list = list.filter((i) => Number(i.price) > 350);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false),
      );
    }

    if (filters.sort === "price_asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (filters.sort === "price_desc") list.sort((a, b) => Number(b.price) - Number(a.price));

    return list;
  }, [items, filters, search, veg]);

  const activeFilterCount =
    (filters.sort ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.diet && !veg ? 1 : 0) +
    (filters.price ? 1 : 0);

  return (
    <SiteLayout>
      <div className="container-wide pt-12 pb-20">
        <div className="sticky top-16 md:top-20 z-20 -mx-5 px-5 py-4 bg-background/90 backdrop-blur-md border-b border-border/50 mb-10">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2.5 shadow-soft">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="relative shrink-0 inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-full text-sm font-medium hover:bg-foreground/90 transition"
            >
              <SlidersHorizontal className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full text-[10px] min-w-5 h-5 px-1 inline-flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Category strip — image circle + name (matches home) */}
          {cats && (
            <div className="mt-4 -mx-1 px-1 overflow-x-auto no-scrollbar">
              <div className="flex gap-5 min-w-max pb-1">
                {cats.map((c) => {
                  const active = activeCat === c.slug;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCat(c.slug);
                        document.getElementById(`cat-${c.slug}`)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="group flex flex-col items-center gap-2 w-20 shrink-0"
                    >
                      <div
                        className={cn(
                          "size-16 rounded-full overflow-hidden ring-1 transition-all",
                          active
                            ? "ring-primary ring-2 scale-105 shadow-card"
                            : "ring-border group-hover:scale-105 group-hover:ring-primary/40",
                        )}
                      >
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-medium text-center leading-tight",
                          active ? "text-primary" : "text-foreground/80",
                        )}
                      >
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mb-12 text-center">
          <h1 className="font-display text-5xl">Our Full Menu</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
            {veg && " · VEG only"}
          </p>
        </div>

        <div className="space-y-16">
          {cats?.map((cat) => {
            const list = filtered.filter((i) => i.category_id === cat.id);
            if (list.length === 0) return null;
            return (
              <section key={cat.id} id={`cat-${cat.slug}`}>
                <div className="flex items-baseline gap-3 mb-6 border-b border-border pb-3">
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
              No dishes matched your filters.
            </p>
          )}
        </div>
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        vegLocked={veg}
      />
    </SiteLayout>
  );
}

/* --------------------------- Filter Drawer (bottom-up) --------------------------- */

type Tab = "sort" | "rating" | "diet" | "price";

function FilterDrawer({
  open,
  onClose,
  filters,
  setFilters,
  vegLocked,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  vegLocked: boolean;
}) {
  const [tab, setTab] = useState<Tab>("sort");
  const [loading, setLoading] = useState(false);

  // brief loading flash for "trust & UI" when filter changes
  const apply = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setLoading(true);
    setFilters({ ...filters, [key]: value });
    setTimeout(() => setLoading(false), 350);
  };

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-3xl shadow-2xl h-[75vh] flex flex-col anim-slide-up">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-primary" />
            <h3 className="font-display text-2xl">Filter</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilters(EMPTY)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left strip */}
          <div className="w-32 sm:w-40 bg-muted/40 border-r border-border overflow-y-auto">
            <TabBtn icon={ArrowUpDown} label="Sort by" active={tab === "sort"} dot={!!filters.sort} onClick={() => setTab("sort")} />
            <TabBtn icon={Star} label="Rating" active={tab === "rating"} dot={!!filters.rating} onClick={() => setTab("rating")} />
            <TabBtn icon={Leaf} label="Veg / Non-veg" active={tab === "diet"} dot={!!filters.diet && !vegLocked} onClick={() => setTab("diet")} />
            <TabBtn icon={IndianRupee} label="Dish price" active={tab === "price"} dot={!!filters.price} onClick={() => setTab("price")} />
          </div>

          {/* Right options */}
          <div className="flex-1 overflow-y-auto p-5 relative">
            {loading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading…
                </div>
              </div>
            )}

            {tab === "sort" && (
              <Options
                value={filters.sort}
                onChange={(v) => apply("sort", v as SortKey)}
                items={[
                  { value: "price_asc", label: "Price: Low to High", icon: <ArrowUpDown className="size-4 rotate-180" /> },
                  { value: "price_desc", label: "Price: High to Low", icon: <ArrowUpDown className="size-4" /> },
                ]}
              />
            )}

            {tab === "rating" && (
              <Options
                value={filters.rating}
                onChange={(v) => apply("rating", v as RatingKey)}
                items={[
                  { value: "3.5", label: "Rated 3.5+", icon: <Star className="size-4 fill-amber-400 text-amber-400" /> },
                  { value: "4.0", label: "Rated 4.0+", icon: <Star className="size-4 fill-amber-400 text-amber-400" /> },
                ]}
              />
            )}

            {tab === "diet" && (
              vegLocked ? (
                <div className="text-sm text-muted-foreground bg-veg/10 border border-veg/30 rounded-xl p-4">
                  <b>VEG mode is on</b> from the home screen. Only veg items are being
                  shown across the site. Turn it off there to use this filter.
                </div>
              ) : (
                <Options
                  value={filters.diet}
                  onChange={(v) => apply("diet", v as DietKey)}
                  items={[
                    { value: "veg", label: "Veg", icon: <Leaf className="size-4 text-veg" /> },
                    { value: "nonveg", label: "Non-veg", icon: <Beef className="size-4 text-nonveg" /> },
                  ]}
                />
              )
            )}

            {tab === "price" && (
              <Options
                value={filters.price}
                onChange={(v) => apply("price", v as PriceKey)}
                items={[
                  { value: "lt100", label: "Under ₹100", icon: <IndianRupee className="size-4" /> },
                  { value: "lt250", label: "Under ₹250", icon: <IndianRupee className="size-4" /> },
                  { value: "gt350", label: "Above ₹350", icon: <IndianRupee className="size-4" /> },
                ]}
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-background">
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:bg-primary/90"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  icon: Icon,
  label,
  active,
  dot,
  onClick,
}: {
  icon: typeof Leaf;
  label: string;
  active: boolean;
  dot: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full text-left px-3 py-4 text-xs sm:text-sm flex items-center gap-2 border-l-2 transition",
        active
          ? "bg-background border-primary text-foreground font-medium"
          : "border-transparent text-foreground/70 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {dot && <span className="size-1.5 rounded-full bg-primary" />}
    </button>
  );
}

function Options({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string; icon: React.ReactNode }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(active ? "" : it.value)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left",
              active
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            {it.icon}
            <span className="flex-1 text-sm font-medium">{it.label}</span>
            <span
              className={cn(
                "size-4 rounded-full border-2",
                active ? "border-primary bg-primary" : "border-border",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

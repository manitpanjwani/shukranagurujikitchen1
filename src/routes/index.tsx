import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Leaf, ShieldCheck, Truck, Wallet, Sparkles, ChevronRight, Search, BadgePercent } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ItemCard } from "@/components/site/ItemCard";
import { supabase } from "@/integrations/supabase/client";
import type { Category, MenuItem, Offer, Faq, Banner } from "@/lib/types";
import { useVegMode } from "@/lib/veg";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shukrana Guruji Kitchen — Home" },
      {
        name: "description",
        content:
          "Premium multi-cuisine kitchen in Pune. Thalis, biryani, rolls, Chinese & more — delivered hot.",
      },
    ],
  }),
  component: HomePage,
});

const SEARCH_HINTS = ['"paratha"', '"pizza"', '"biryani"', '"thali"', '"paneer"', '"momos"', '"gulab jamun"'];

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Categories />
      <Bestsellers />
      <Offers />
      <WhyUs />
      <DeliveryAreas />
      <Reviews />
      <FaqSection />
    </SiteLayout>
  );
}

/* -------------------------------- HERO -------------------------------- */

function Hero() {
  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      return data as Banner[];
    },
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth < 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const [slide, setSlide] = useState(0);
  const images = useMemo(
    () =>
      (banners ?? [])
        .map((b) => (isMobile ? b.mobile_url || b.desktop_url : b.desktop_url || b.mobile_url))
        .filter(Boolean) as string[],
    [banners, isMobile],
  );

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  const [hint, setHint] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % SEARCH_HINTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const [veg, setVeg] = useVegMode();

  return (
    <section className="relative h-[78vh] min-h-[560px] overflow-hidden">
      {/* Images: instant swap, no transition */}
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            i === slide ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/70" />

      {/* Stable overlay: doesn't reload with image */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-5">
        {/* Transparent search bar + VEG toggle */}
        <div className="w-full max-w-2xl flex items-center gap-2">
          <Link
            to="/menu"
            className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-full pl-5 pr-4 py-3.5 text-white hover:bg-white/15 transition group"
          >
            <Search className="size-4 text-white/80 shrink-0" />
            <span className="text-sm text-white/70 shrink-0">Search</span>
            <span className="relative inline-block h-5 overflow-hidden flex-1 min-w-0">
              <span
                key={hint}
                className="absolute inset-0 text-sm font-medium text-white anim-vert-roll whitespace-nowrap"
              >
                {SEARCH_HINTS[hint]}
              </span>
            </span>
          </Link>

          <button
            onClick={() => setVeg(!veg)}
            aria-pressed={veg}
            className={cn(
              "shrink-0 flex items-center gap-2 backdrop-blur-md border rounded-full px-4 py-3.5 text-sm font-medium transition",
              veg
                ? "bg-veg/85 border-veg text-white"
                : "bg-white/10 border-white/30 text-white hover:bg-white/15",
            )}
          >
            <span
              className={cn(
                "inline-flex size-4 items-center justify-center border-2 rounded-sm",
                veg ? "border-white" : "border-white",
              )}
            >
              <span className={cn("size-1.5 rounded-full", veg ? "bg-white" : "bg-white")} />
            </span>
            VEG
          </button>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/menu"
            className="bg-primary text-primary-foreground rounded-full px-7 py-3 font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition shadow-card"
          >
            Order Now <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/menu"
            className="border border-white/50 hover:bg-white/10 transition text-white rounded-full px-7 py-3 font-medium text-sm"
          >
            Explore Menu
          </Link>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === slide ? "w-10 bg-primary" : "w-6 bg-white/40",
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ Categories ------------------------------ */

function Categories() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data as Category[];
    },
  });

  const cats = data ?? [];
  const showSeeAll = cats.length > 10;

  return (
    <section className="py-16 md:py-20">
      <div className="container-wide text-center mb-10">
        <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
          The cuisines
        </div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">What are you craving?</h2>
        <p className="text-sm text-muted-foreground mt-2">Pick a category to explore</p>
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-1 px-5">
        <div className="flex gap-6 md:gap-8 min-w-max pb-3 mx-auto justify-start md:justify-center">
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/menu"
              hash={c.slug}
              className="group flex flex-col items-center gap-3 w-24 md:w-28 shrink-0"
            >
              <div className="relative size-24 md:size-28 rounded-full overflow-hidden ring-1 ring-border shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-card group-hover:ring-primary/40">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-2xl">
                    {c.icon ?? "🍽️"}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-center transition-all duration-300 group-hover:text-primary group-hover:-translate-y-0.5">
                {c.name}
              </div>
            </Link>
          ))}

          {showSeeAll && (
            <Link
              to="/menu"
              className="group flex flex-col items-center gap-3 w-24 md:w-28 shrink-0"
            >
              <div className="size-24 md:size-28 rounded-full bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <ChevronRight className="size-8 text-primary group-hover:text-primary-foreground" />
              </div>
              <div className="text-sm font-medium text-center text-primary">See all</div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Bestsellers ------------------------------ */

function Bestsellers() {
  const [veg] = useVegMode();
  const { data } = useQuery({
    queryKey: ["bestsellers", veg],
    queryFn: async () => {
      let q = supabase.from("menu_items").select("*").eq("is_bestseller", true);
      if (veg) q = q.eq("is_veg", true);
      const { data } = await q.order("rating", { ascending: false }).limit(6);
      return data as MenuItem[];
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-20">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
              ★ Top rated
            </div>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Today's Bestsellers</h2>
          </div>
          <Link to="/menu" className="text-sm text-primary font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((i) => (
            <ItemCard key={i.id} item={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Offers --------------------------------- */

function Offers() {
  const { data } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      return data as Offer[];
    },
  });

  return (
    <section className="container-wide py-20">
      <div className="text-center mb-12">
        <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">Offers</div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Offers Coming</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {data?.map((o) => (
          <div
            key={o.id}
            className="relative bg-gradient-to-br from-primary/10 via-amber-100 to-background border border-primary/20 rounded-3xl p-8 overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-[10px] uppercase tracking-wider bg-foreground text-background px-2.5 py-1 rounded-full">
              Limited time
            </div>
            <BadgePercent className="size-7 text-primary" />
            <h3 className="font-display text-3xl mt-4">{o.title}</h3>
            <p className="text-muted-foreground mt-2">{o.subtitle}</p>
            {o.code && (
              <div className="mt-5 inline-flex items-center gap-2 border border-dashed border-primary/40 rounded-lg px-3 py-1.5 text-sm font-mono">
                Code: <span className="font-semibold text-primary">{o.code}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Why us -------------------------------- */

const WHY_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Hygienic Kitchen",
    desc: "FSSAI-grade, sanitised daily, fresh oil every batch.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    desc: "Sourced every morning. Never frozen, never reheated.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Average 32 minutes — packed to stay piping hot.",
  },
  {
    icon: Wallet,
    title: "Affordable Pricing",
    desc: "Premium taste at fair prices. No hidden charges.",
  },
];

function WhyUs() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % WHY_ITEMS.length), 3800);
    return () => clearInterval(t);
  }, []);

  const current = WHY_ITEMS[active];
  const Icon = current.icon;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Circular rotation background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="anim-spin-slow w-[120vw] max-w-[1100px] aspect-square rounded-full border border-dashed border-primary/20" />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="anim-spin-slow w-[80vw] max-w-[750px] aspect-square rounded-full border border-dashed border-primary/15" style={{ animationDirection: "reverse" }} />
      </div>

      <div className="relative container-wide text-center mb-10">
        <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">Why us</div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Why Shukrana Guruji?</h2>
      </div>

      {/* 3:4 flashcard — one at a time, auto switch */}
      <div className="relative container-wide flex justify-center">
        <div
          className="relative bg-card border border-border/60 rounded-3xl shadow-card overflow-hidden"
          style={{ aspectRatio: "3 / 4", width: "min(320px, 80vw)" }}
        >
          <div
            key={active}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-7 animate-in fade-in zoom-in-95 duration-500"
          >
            <div className="size-28 md:size-32 rounded-full bg-primary/10 flex items-center justify-center mb-7">
              <Icon className="size-16 md:size-20 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-3xl md:text-4xl">{current.title}</h3>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{current.desc}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-7 flex justify-center gap-2">
        {WHY_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Reason ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-10 bg-primary" : "w-2.5 bg-border",
            )}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Delivery areas --------------------------- */

function DeliveryAreas() {
  const areas = ["Kharadi", "Viman Nagar", "Wagholi", "Hadapsar"];
  return (
    <section className="bg-foreground text-background py-20">
      <div className="container-wide text-center">
        <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
          Currently delivering in
        </div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Pune neighborhoods we love</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {areas.map((a) => (
            <span
              key={a}
              className="px-6 py-2.5 rounded-full border border-background/20 text-sm hover:bg-background/10 transition"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Google reviews (Elfsight) --------------------------- */

function Reviews() {
  useEffect(() => {
    const id = "elfsight-platform-js";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://elfsightcdn.com/platform.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <section className="container-wide py-20">
      <div className="text-center mb-10">
        <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
          Loved by guests
        </div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">What people say on Google</h2>
      </div>
      <div
        className="elfsight-app-3e6f4e5d-8ba3-4721-968f-35cded2311a0"
        data-elfsight-app-lazy
      />
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

function FaqSection() {
  const { data } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*").order("sort_order");
      return data as Faq[];
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="container-wide py-20">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-5xl">Frequently asked</h2>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible>
          {data.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, ArrowRight, Leaf, Sparkles, Truck, Wallet, ShieldCheck, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ItemCard } from "@/components/site/ItemCard";
import { supabase } from "@/integrations/supabase/client";
import type { Category, MenuItem, Offer, Faq } from "@/lib/types";
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
      { title: "Shukrana Guruji Kitchen — Slow-cooked. Soulfully served." },
      {
        name: "description",
        content:
          "Premium multi-cuisine cloud kitchen, delivered hot to your door across Pune. Order thalis, biryani, rolls, Chinese, and more.",
      },
    ],
  }),
  component: HomePage,
});

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&h=900&q=80",
  "https://images.unsplash.com/photo-1542367597-8849eb950fd8?auto=format&fit=crop&w=1600&h=900&q=80",
];

const SEARCH_HINTS = ["biryani", "thali", "paneer", "mango lassi", "gulab jamun"];

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Categories />
      <Bestsellers />
      <Offers />
      <CategoryPreview />
      <WhyUs />
      <DeliveryAreas />
      <Reviews />
      <FaqSection />
    </SiteLayout>
  );
}

function Hero() {
  const [slide, setSlide] = useState(0);
  const [hint, setHint] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % SEARCH_HINTS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[78vh] min-h-[560px] overflow-hidden">
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === slide ? "opacity-100" : "opacity-0",
          )}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        </div>
      ))}

      <div className="relative z-10 container-wide h-full flex flex-col items-center justify-center text-center text-white">
        <h1 className="font-display text-5xl md:text-7xl italic max-w-4xl drop-shadow-lg">
          Slow-cooked. Soulfully served.
        </h1>
        <p className="mt-5 text-lg md:text-xl text-white/90 max-w-xl">
          Premium multi-cuisine cloud kitchen, delivered hot to your door.
        </p>

        <div className="mt-8 w-full max-w-2xl flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 rounded-full p-1.5">
          <div className="flex-1 flex items-center gap-2 px-4">
            <Search className="size-4 text-white/80" />
            <span className="text-sm text-white/80">
              Search <em className="not-italic font-medium">"{SEARCH_HINTS[hint]}"</em>
            </span>
          </div>
          <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition text-sm rounded-full px-4 py-2">
            <Leaf className="size-3.5" /> VEG
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
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
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
      {children}
    </div>
  );
}

function Categories() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  return (
    <section className="container-wide py-20">
      <div className="text-center mb-12">
        <SectionEyebrow>The Cuisines</SectionEyebrow>
        <h2 className="font-display text-4xl md:text-5xl mt-3">What are you craving?</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
        {data?.map((c) => (
          <Link
            key={c.id}
            to="/menu"
            hash={c.slug}
            className="group flex flex-col items-center text-center gap-3"
          >
            <div className="relative size-24 md:size-28 rounded-full overflow-hidden ring-1 ring-border shadow-soft group-hover:shadow-card group-hover:scale-105 transition-all">
              {c.image_url && (
                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="text-sm font-medium group-hover:text-primary transition-colors">
              {c.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Bestsellers() {
  const { data } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_bestseller", true)
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  return (
    <section className="bg-secondary/40 py-20">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
          <div>
            <SectionEyebrow>⭐ Top Rated</SectionEyebrow>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Today's Bestsellers</h2>
          </div>
          <Link to="/menu" className="text-sm text-primary font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((i) => <ItemCard key={i.id} item={i} />)}
        </div>
      </div>
    </section>
  );
}

function Offers() {
  const { data } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Offer[];
    },
  });

  return (
    <section className="container-wide py-20">
      <div className="text-center mb-12">
        <SectionEyebrow>Offers</SectionEyebrow>
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
            <Sparkles className="size-7 text-primary" />
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

function CategoryPreview() {
  const { data: cats } = useQuery({
    queryKey: ["cats-preview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .in("slug", ["thalis", "biryani", "chinese"])
        .order("sort_order");
      return data as Category[];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["items-preview"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("sort_order");
      return data as MenuItem[];
    },
  });

  return (
    <section className="bg-secondary/40 py-20">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
          <div>
            <SectionEyebrow>The Menu</SectionEyebrow>
            <h2 className="font-display text-4xl md:text-5xl mt-3">A taste of every category</h2>
          </div>
          <Link to="/menu" className="text-sm text-primary font-medium hover:underline">
            See full menu →
          </Link>
        </div>

        <div className="space-y-14">
          {cats?.map((cat) => {
            const list = items?.filter((i) => i.category_id === cat.id).slice(0, 3) ?? [];
            return (
              <div key={cat.id}>
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-3xl">{cat.icon}</span>
                  <h3 className="font-display text-3xl">{cat.name}</h3>
                  <span className="text-sm text-muted-foreground">· {list.length} picks</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((i) => <ItemCard key={i.id} item={i} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const WHY_ITEMS = [
  { icon: ShieldCheck, title: "Hygienic Kitchen", desc: "FSSAI-grade, sanitised, fresh oil daily" },
  { icon: Leaf, title: "Fresh Ingredients", desc: "Sourced every morning, never frozen" },
  { icon: Truck, title: "Fast Delivery", desc: "Avg 32 mins, packed to stay hot" },
  { icon: Wallet, title: "Affordable Pricing", desc: "Premium taste, fair prices, always" },
];

function WhyUs() {
  return (
    <section className="container-wide py-20">
      <div className="text-center mb-12">
        <SectionEyebrow>Why us</SectionEyebrow>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Why Shukrana Guruji?</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {WHY_ITEMS.map((w) => (
          <div
            key={w.title}
            className="bg-card border border-border/60 rounded-2xl p-7 shadow-soft hover:shadow-card transition text-center"
          >
            <div className="size-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <w.icon className="size-7 text-primary" />
            </div>
            <h3 className="font-display text-xl mt-5">{w.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{w.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

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

const REVIEWS = [
  { name: "Sanjay Sharma", text: "I'm a frequent visitor to Pune for official purpose and I must say the food is awesome and homelike quality, less oily, less spicy and too tasty. Must try if you are nearby." },
  { name: "Artist Poonam Rana", text: "Shukrana Guruji Kitchen ka khana ekdum ghar jaisa lagta hai 🙏 Taste, hygiene aur service sab top class hai. Highly recommended!" },
  { name: "Manit Panjwani", text: "Ordered for the first time and honestly, the food was amazing. Proper homemade taste, fresh, well-cooked and comforting. Definitely coming back." },
  { name: "Lavina Hemrajani", text: "Amazing taste 😋, hygiene being maintained, superb vibes" },
  { name: "Priyanka Singh", text: "The food was tasty, fresh, and hygienically packed. Good quality, great taste, and timely delivery. Will definitely order again 🥰" },
  { name: "Pawan Tiwari", text: "Good food. Worth of money. Must try. Feels home made." },
];

function Reviews() {
  return (
    <section className="container-wide py-20">
      <div className="text-center mb-12">
        <SectionEyebrow>Loved by guests</SectionEyebrow>
        <h2 className="font-display text-4xl md:text-5xl mt-3">What people say on Google</h2>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Star className="size-4 fill-amber-400 text-amber-400" /> 5.0 · 23 reviews
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REVIEWS.map((r) => (
          <div key={r.name} className="bg-card border border-border/60 rounded-2xl p-6 shadow-soft">
            <div className="flex gap-0.5 mb-3">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{r.text}</p>
            <div className="mt-4 text-sm font-medium">— {r.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const { data } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*").order("sort_order");
      return data as Faq[];
    },
  });

  return (
    <section className="container-wide py-20">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-5xl">Frequently asked</h2>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible>
          {data?.map((f) => (
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

import { Link } from "@tanstack/react-router";
import { Star, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { addToCart, updateQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

const FIRST_ADD_KEY = "sgk-first-add-done";

function VegBadge({ veg }: { veg: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-4 items-center justify-center border-2 rounded-sm",
        veg ? "border-veg" : "border-nonveg",
      )}
      aria-label={veg ? "Veg" : "Non-veg"}
    >
      <span className={cn("size-1.5 rounded-full", veg ? "bg-veg" : "bg-nonveg")} />
    </span>
  );
}

const CONFETTI = ["#e87722", "#f6c453", "#3aa856", "#e23744", "#7b5cff", "#28b6f6"];

function Confetti() {
  return (
    <span className="anim-confetti pointer-events-none absolute inset-0">
      {CONFETTI.map((c, i) => {
        const angle = (i / CONFETTI.length) * Math.PI * 2;
        const tx = Math.cos(angle) * 14;
        const ty = Math.sin(angle) * 14;
        return (
          <span
            key={i}
            style={{
              background: c,
              ["--tx" as any]: `${tx}px`,
              ["--ty" as any]: `${ty}px`,
              animationDelay: `${i * 20}ms`,
            }}
          />
        );
      })}
    </span>
  );
}

export function ItemCard({ item }: { item: MenuItem }) {
  const cart = useCart();
  const inCart = cart.find((i) => i.id === item.id);
  const qty = inCart?.qty ?? 0;

  const [celebrate, setCelebrate] = useState(false);

  const handleAdd = () => {
    const isFirstEver =
      typeof window !== "undefined" && !localStorage.getItem(FIRST_ADD_KEY);
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image_url: item.image_url,
    });
    if (isFirstEver) {
      localStorage.setItem(FIRST_ADD_KEY, "1");
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 900);
    }
  };

  return (
    <div className="group relative bg-card rounded-2xl border border-border/60 shadow-soft hover:shadow-card transition-all overflow-hidden flex">
      <div className="flex-1 p-5 pr-3 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <VegBadge veg={item.is_veg} />
          {item.is_bestseller && (
            <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              ★ Bestseller
            </span>
          )}
        </div>
        <Link
          to="/product/$slug"
          params={{ slug: item.slug }}
          className="font-display text-xl text-foreground hover:text-primary transition-colors"
        >
          {item.name}
        </Link>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-veg text-veg" />
          <span className="font-medium text-foreground">{Number(item.rating).toFixed(1)}</span>
          <span>· {item.reviews_count} reviews</span>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
        )}
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="font-semibold text-lg">{formatPrice(item.price)}</span>
          {item.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(item.compare_at_price)}
            </span>
          )}
        </div>
      </div>
      <div className="relative w-36 sm:w-44 shrink-0 m-3 ml-0">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
          />
        )}
        {!item.in_stock && (
          <div className="absolute inset-0 bg-foreground/60 rounded-xl flex items-center justify-center">
            <span className="text-background text-xs font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {qty === 0 ? (
          <button
            disabled={!item.in_stock}
            onClick={handleAdd}
            className={cn(
              "absolute -bottom-3 left-1/2 -translate-x-1/2 bg-destructive/15 hover:bg-destructive/25 text-destructive border border-destructive/40 backdrop-blur-sm text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-full shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition",
              celebrate && "anim-celebrate",
            )}
          >
            ADD
            {celebrate && <Confetti />}
          </button>
        ) : (
          <div
            className="anim-stepper-in absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-destructive/15 border border-destructive/40 backdrop-blur-sm rounded-full shadow-card px-1.5 py-1"
          >
            <button
              onClick={() => updateQty(item.id, qty - 1)}
              className="size-7 rounded-full bg-background/80 hover:bg-background text-destructive flex items-center justify-center transition active:scale-90"
              aria-label="Decrease"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-6 text-center text-sm font-bold text-destructive tabular-nums">
              {qty}
            </span>
            <button
              onClick={() => updateQty(item.id, qty + 1)}
              className="size-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center transition active:scale-90"
              aria-label="Increase"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

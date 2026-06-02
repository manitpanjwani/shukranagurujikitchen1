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

        <AddControl
          qty={qty}
          inStock={item.in_stock}
          onAdd={handleAdd}
          onInc={() => updateQty(item.id, qty + 1)}
          onDec={() => updateQty(item.id, qty - 1)}
          celebrate={celebrate}
        />

      </div>
    </div>
  );
}

/**
 * AddControl — minimal pill that morphs between ADD and a − qty + stepper.
 * Both states share the exact same box (centered, fixed size) so nothing shifts.
 * We render both stacked and crossfade with opacity, eliminating mount flicker.
 */
function AddControl({
  qty,
  inStock,
  onAdd,
  onInc,
  onDec,
  celebrate,
}: {
  qty: number;
  inStock: boolean;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  celebrate: boolean;
}) {
  const hasQty = qty > 0;

  return (
    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[104px] h-8">
      {/* ADD state */}
      <button
        type="button"
        disabled={!inStock || hasQty}
        onClick={onAdd}
        aria-hidden={hasQty}
        tabIndex={hasQty ? -1 : 0}
        className={cn(
          "absolute inset-0 w-full h-full rounded-md bg-background text-destructive border border-destructive/50",
          "text-[11px] font-semibold tracking-[0.15em] shadow-sm transition-opacity duration-150",
          "hover:bg-destructive/5 disabled:cursor-not-allowed",
          hasQty ? "opacity-0 pointer-events-none" : "opacity-100",
          celebrate && "anim-celebrate",
        )}
      >
        ADD
        {celebrate && <Confetti />}
      </button>

      {/* Stepper state */}
      <div
        aria-hidden={!hasQty}
        className={cn(
          "absolute inset-0 flex items-stretch rounded-md bg-background border border-destructive/50 shadow-sm overflow-hidden",
          "transition-opacity duration-150",
          hasQty ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <button
          type="button"
          onClick={onDec}
          tabIndex={hasQty ? 0 : -1}
          aria-label="Decrease quantity"
          className="flex-1 grid place-items-center text-destructive hover:bg-destructive/5 active:scale-95 transition"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="grid place-items-center min-w-7 text-xs font-semibold text-destructive tabular-nums select-none">
          {qty}
        </span>
        <button
          type="button"
          onClick={onInc}
          tabIndex={hasQty ? 0 : -1}
          aria-label="Increase quantity"
          className="flex-1 grid place-items-center text-destructive hover:bg-destructive/5 active:scale-95 transition"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

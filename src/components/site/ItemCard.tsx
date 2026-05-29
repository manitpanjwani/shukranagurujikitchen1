import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

function VegBadge({ veg }: { veg: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-4 items-center justify-center border-2 rounded-sm",
        veg ? "border-veg" : "border-nonveg",
      )}
      aria-label={veg ? "Veg" : "Non-veg"}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          veg ? "bg-veg" : "bg-nonveg",
        )}
      />
    </span>
  );
}

export function ItemCard({ item }: { item: MenuItem }) {
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
        <button
          disabled={!item.in_stock}
          onClick={() =>
            addToCart({
              id: item.id,
              name: item.name,
              price: Number(item.price),
              image_url: item.image_url,
            })
          }
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full shadow-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
        >
          ADD
        </button>
      </div>
    </div>
  );
}

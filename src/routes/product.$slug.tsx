import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = useParams({ from: "/product/$slug" });

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      return data as MenuItem | null;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-wide py-20 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!item) {
    return (
      <SiteLayout>
        <div className="container-wide py-20 text-center">
          <h1 className="font-display text-3xl">Dish not found</h1>
          <Link to="/menu" className="text-primary mt-4 inline-block">← Back to menu</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-wide py-10">
        <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Back to menu
        </Link>

        <div className="mt-8 grid md:grid-cols-2 gap-10 items-start">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-card">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            )}
            {!item.in_stock && (
              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                <span className="text-background text-lg font-semibold uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex size-4 items-center justify-center border-2 rounded-sm ${item.is_veg ? "border-veg" : "border-nonveg"}`}>
                <span className={`size-1.5 rounded-full ${item.is_veg ? "bg-veg" : "bg-nonveg"}`} />
              </span>
              {item.is_bestseller && (
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                  ★ Bestseller
                </span>
              )}
            </div>
            <h1 className="font-display text-5xl mt-3">{item.name}</h1>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{Number(item.rating).toFixed(1)}</span>
              <span>· {item.reviews_count} reviews</span>
            </div>
            {item.description && (
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}
            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-display text-4xl">{formatPrice(item.price)}</span>
              {item.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(item.compare_at_price)}
                </span>
              )}
            </div>
            <button
              disabled={!item.in_stock}
              onClick={() => {
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: Number(item.price),
                  image_url: item.image_url,
                });
                toast.success(`${item.name} added to cart`);
              }}
              className="mt-8 bg-primary text-primary-foreground rounded-full px-8 py-4 font-medium hover:bg-primary/90 transition shadow-card disabled:opacity-50"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

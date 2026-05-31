import { Link, useRouter } from "@tanstack/react-router";
import { Home, UtensilsCrossed, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function BottomNav({ onCartClick }: { onCartClick: () => void }) {
  const router = useRouter();
  const path = router.state.location.pathname;
  const cart = useCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/menu", label: "Menu", icon: UtensilsCrossed },
    { label: "Cart", icon: ShoppingBag, onClick: onCartClick, badge: count },
    { to: "/contact", label: "Contact", icon: User },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {items.map((it) => {
          const active = "to" in it && it.to === path;
          const Icon = it.icon;
          const inner = (
            <div className={cn("flex flex-col items-center justify-center gap-0.5 transition-colors", active ? "text-primary" : "text-foreground/70")}>
              <span className="relative inline-flex">
                <Icon className={cn("size-6", active && "stroke-[2.4]")} />
                {"badge" in it && it.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground rounded-full text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center font-semibold leading-none">
                    {it.badge}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium">{it.label}</span>
            </div>
          );
          if ("onClick" in it) {
            return (
              <button key={it.label} onClick={it.onClick} className="h-full w-full">
                {inner}
              </button>
            );
          }
          return (
            <Link key={it.label} to={it.to} className="h-full w-full flex">
              <div className="flex-1">{inner}</div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

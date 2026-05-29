import { Link, useRouter } from "@tanstack/react-router";
import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const router = useRouter();
  const path = router.state.location.pathname;
  const cart = useCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border/60">
      <div className="container-wide flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shadow-soft border border-amber-500/30">
            <span className="font-display text-lg italic text-amber-900">SG</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl">
              Shukrana <span className="text-primary">Guruji</span>
            </div>
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Kitchen
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-foreground/80 hover:text-primary",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onCartClick}
            className="hidden md:inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium shadow-soft hover:bg-foreground/90 transition"
          >
            <ShoppingBag className="size-4" />
            Cart
            {count > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 rounded-md hover:bg-muted"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-wide py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium"
              >
                {n.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onCartClick();
              }}
              className="mt-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2"
            >
              <ShoppingBag className="size-4" /> Cart {count > 0 && `(${count})`}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

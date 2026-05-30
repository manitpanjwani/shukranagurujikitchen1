import { Link, useRouter } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import centerMark from "@/assets/center-mark.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function NavIcon({ open }: { open: boolean }) {
  // Custom three-line / sleek icon
  return (
    <span className="relative block w-6 h-6">
      <span
        className={cn(
          "absolute left-0 right-0 h-[2px] bg-current rounded-full transition-all duration-300",
          open ? "top-2.5 rotate-45" : "top-1.5",
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-[2px] bg-current rounded-full transition-all duration-300",
          open ? "top-2.5 right-0 opacity-0" : "top-3 right-1.5",
        )}
      />
      <span
        className={cn(
          "absolute left-0 right-0 h-[2px] bg-current rounded-full transition-all duration-300",
          open ? "top-2.5 -rotate-45" : "top-[18px]",
        )}
      />
    </span>
  );
}

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const router = useRouter();
  const path = router.state.location.pathname;
  const cart = useCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border/60">
      {/* MOBILE: nav left · logo center · cart right */}
      <div className="md:hidden relative flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2 -ml-2 text-foreground"
          aria-label="Menu"
        >
          <NavIcon open={open} />
        </button>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={centerMark} alt="Shukrana Guruji Kitchen" className="size-11 object-contain" />
        </Link>
        <button
          onClick={onCartClick}
          className="relative p-2 -mr-2 text-foreground"
          aria-label="Cart"
        >
          <ShoppingBag className="size-6" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full text-[10px] min-w-4 h-4 px-1 flex items-center justify-center font-semibold">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex container-wide items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src={centerMark} alt="Shukrana Guruji Kitchen" className="size-12 object-contain" />
          <span className="font-display text-xl tracking-tight">
            Shukrana <span className="text-primary italic">Guruji</span>
          </span>
        </Link>

        <nav className="flex items-center gap-10">
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

        <button
          onClick={onCartClick}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium shadow-soft hover:bg-foreground/90 transition"
        >
          <ShoppingBag className="size-4" />
          Cart
          {count > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* MOBILE menu sheet */}
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container-wide py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-3 px-2 text-base font-medium rounded-lg",
                  path === n.to ? "text-primary" : "text-foreground/85 hover:bg-muted",
                )}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

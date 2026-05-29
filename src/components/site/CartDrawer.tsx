import { useEffect } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, updateQty, removeFromCart, clearCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCart();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-background h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-display text-2xl">Your Cart</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Your cart is empty. Pick something delicious from the menu.
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 bg-card rounded-xl p-3 border">
                  {i.image_url && (
                    <img src={i.image_url} className="size-16 rounded-lg object-cover" alt={i.name} />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-sm text-muted-foreground">{formatPrice(i.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(i.id, i.qty - 1)}
                        className="size-7 border rounded-full flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                      <button
                        onClick={() => updateQty(i.id, i.qty + 1)}
                        className="size-7 border rounded-full flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(i.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6 space-y-3">
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <button className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition">
              Checkout via call · +91 90000 00000
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs text-muted-foreground hover:text-destructive"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

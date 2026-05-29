import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
};

const KEY = "sgk-cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function getCart() {
  return read();
}

export function addToCart(item: Omit<CartItem, "qty">) {
  const items = read();
  const existing = items.find((i) => i.id === item.id);
  if (existing) existing.qty += 1;
  else items.push({ ...item, qty: 1 });
  write(items);
}

export function removeFromCart(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function updateQty(id: string, qty: number) {
  const items = read().map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0);
  write(items);
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const onChange = () => setItems(read());
    window.addEventListener("cart:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cart:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return items;
}

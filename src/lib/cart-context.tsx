import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/menu";
import { itemTotal } from "@/data/menu";

export interface CartItem {
  id: string; // unique per config (product + options combo)
  productId: string;
  name: string;
  unit: Product["unit"];
  price: number;
  qty: number;
  minQty: number;
  step: number;
  selections: Record<string, string[]>; // group label -> chosen option names
}

interface CartCtx {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "doce-sonho-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const subtotal = items.reduce(
      (s, i) => s + (i.unit === "cento" ? (i.price / 100) * i.qty : i.price * i.qty),
      0,
    );
    return {
      items,
      addItem: (item) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.id === item.id);
          if (existing) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + item.qty } : p));
          return [...prev, item];
        }),
      updateQty: (id, qty) =>
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p))),
      removeItem: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      clear: () => setItems([]),
      count: items.reduce((n, i) => n + 1, 0),
      subtotal,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function calcItemTotal(item: CartItem) {
  return item.unit === "cento" ? (item.price / 100) * item.qty : item.price * item.qty;
}

export { itemTotal };

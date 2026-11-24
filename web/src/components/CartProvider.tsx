"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { productId: string; slug: string; name: string; priceCents: number; category: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ordinateur-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const value: CartContextValue = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    totalCents: items.reduce((n, i) => n + i.priceCents * i.quantity, 0),
    add: (item, quantity = 1) =>
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: Math.min(10, i.quantity + quantity) } : i));
        return [...prev, { ...item, quantity }];
      }),
    setQuantity: (productId, quantity) =>
      setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(10, quantity)) } : i))),
    remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
    clear: () => setItems([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}

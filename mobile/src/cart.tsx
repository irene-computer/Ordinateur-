import { createContext, useContext, useState } from "react";
import type { Product } from "./api";

export type CartItem = { product: Product; quantity: number };

type CartValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  add: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const value: CartValue = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    totalCents: items.reduce((n, i) => n + i.product.priceCents * i.quantity, 0),
    add: (product) =>
      setItems((prev) =>
        prev.some((i) => i.product.id === product.id)
          ? prev.map((i) => (i.product.id === product.id ? { ...i, quantity: Math.min(10, i.quantity + 1) } : i))
          : [...prev, { product, quantity: 1 }],
      ),
    setQuantity: (productId, quantity) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.product.id !== productId)
          : prev.map((i) => (i.product.id === productId ? { ...i, quantity: Math.min(10, quantity) } : i)),
      ),
    clear: () => setItems([]),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart hors de CartProvider");
  return ctx;
}

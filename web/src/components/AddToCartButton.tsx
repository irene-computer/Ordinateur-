"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

type Props = {
  product: { id: string; slug: string; name: string; priceCents: number; category: string; stock: number };
  compact?: boolean;
};

export function AddToCartButton({ product, compact }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) return <button className="btn" disabled>Rupture</button>;

  return (
    <button
      className={compact ? "btn btn-primary btn-sm" : "btn btn-primary"}
      onClick={() => {
        add({ productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, category: product.category });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Ajouté ✓" : compact ? "Ajouter" : "Ajouter au panier"}
    </button>
  );
}

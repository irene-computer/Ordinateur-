"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { CATEGORY_ICONS, formatPrice, shippingFor } from "@/lib/format";

export default function CartPage() {
  const { items, totalCents, setQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Votre panier est vide</h1>
        <Link href="/produits" className="btn btn-primary">Découvrir le catalogue</Link>
      </div>
    );
  }

  const shipping = shippingFor(totalCents);

  return (
    <>
      <h1>Panier</h1>
      <div className="cart">
        <ul className="cart-lines">
          {items.map((i) => (
            <li key={i.productId} className="cart-line">
              <span className="cart-icon">{CATEGORY_ICONS[i.category] ?? "🖥️"}</span>
              <Link href={`/produits/${i.slug}`} className="cart-name">{i.name}</Link>
              <input
                type="number" min={1} max={10} value={i.quantity} aria-label="Quantité"
                onChange={(e) => setQuantity(i.productId, Number(e.target.value))}
              />
              <strong>{formatPrice(i.priceCents * i.quantity)}</strong>
              <button className="link-btn" onClick={() => remove(i.productId)}>Retirer</button>
            </li>
          ))}
        </ul>
        <aside className="summary">
          <div className="row"><span>Sous-total</span><span>{formatPrice(totalCents)}</span></div>
          <div className="row"><span>Livraison</span><span>{shipping ? formatPrice(shipping) : "Offerte"}</span></div>
          <div className="row total"><span>Total</span><span>{formatPrice(totalCents + shipping)}</span></div>
          <Link href="/commande" className="btn btn-primary btn-block">Commander</Link>
        </aside>
      </div>
    </>
  );
}

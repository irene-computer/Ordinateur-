"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice, shippingFor } from "@/lib/format";

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const shipping = shippingFor(totalCents);

  if (items.length === 0) {
    return <p className="empty">Votre panier est vide.</p>;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur inattendue");
      setLoading(false);
      return;
    }
    clear();
    if (data.url.startsWith(window.location.origin)) router.push(data.url.slice(window.location.origin.length));
    else window.location.href = data.url; // Stripe Checkout
  }

  return (
    <>
      <h1>Livraison et paiement</h1>
      <div className="cart">
        <form className="form" onSubmit={onSubmit}>
          <label>Nom complet<input name="fullName" required autoComplete="name" /></label>
          <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
          <label>Adresse<input name="address" required autoComplete="street-address" /></label>
          <div className="form-row">
            <label>Code postal<input name="postalCode" required autoComplete="postal-code" /></label>
            <label>Ville<input name="city" required autoComplete="address-level2" /></label>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Traitement…" : `Payer ${formatPrice(totalCents)}`}
          </button>
          <p className="muted small">Paiement sécurisé par Stripe. Sans clé Stripe configurée, le paiement est simulé.</p>
        </form>
        <aside className="summary">
          {items.map((i) => (
            <div className="row" key={i.productId}><span>{i.quantity} × {i.name}</span><span>{formatPrice(i.priceCents * i.quantity)}</span></div>
          ))}
          <div className="row"><span>Livraison</span><span>{shipping ? formatPrice(shipping) : "Offerte"}</span></div>
          <div className="row total"><span>Total</span><span>{formatPrice(totalCents + shipping)}</span></div>
        </aside>
      </div>
    </>
  );
}

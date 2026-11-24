"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { count } = useCart();
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          Ordinateur<span>+</span>
        </Link>
        <form action="/produits" className="search">
          <input name="q" placeholder="Rechercher un produit, une marque…" aria-label="Rechercher" />
        </form>
        <nav className="nav">
          <Link href="/produits">Catalogue</Link>
          <Link href="/panier" className="cart-link">
            Panier {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

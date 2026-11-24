import Link from "next/link";
import type { Product } from "@prisma/client";
import { CATEGORY_ICONS, formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <Link href={`/produits/${product.slug}`} className="card-media" aria-hidden tabIndex={-1}>
        <span>{CATEGORY_ICONS[product.category] ?? "🖥️"}</span>
      </Link>
      <div className="card-body">
        <p className="muted small">{product.brand} · {product.category}</p>
        <h3>
          <Link href={`/produits/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="muted small clamp">{product.description}</p>
        <div className="card-footer">
          <strong className="price">{formatPrice(product.priceCents)}</strong>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}

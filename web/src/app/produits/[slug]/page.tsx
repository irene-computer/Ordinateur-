import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CATEGORY_ICONS, formatPrice, parseSpecs } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();
  const specs = parseSpecs(product.specs);

  return (
    <>
      <p className="muted small">
        <Link href="/produits">Catalogue</Link> / <Link href={`/produits?categorie=${encodeURIComponent(product.category)}`}>{product.category}</Link>
      </p>
      <div className="product">
        <div className="product-media">{CATEGORY_ICONS[product.category] ?? "🖥️"}</div>
        <div>
          <p className="muted">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="price big">{formatPrice(product.priceCents)}</p>
          <p>{product.description}</p>
          <p className={product.stock > 0 ? "stock ok" : "stock out"}>
            {product.stock > 5 ? "En stock" : product.stock > 0 ? `Plus que ${product.stock} en stock` : "Rupture de stock"}
          </p>
          <AddToCartButton product={product} />
          <h2 className="section-title">Caractéristiques</h2>
          <table className="specs">
            <tbody>
              {Object.entries(specs).map(([k, v]) => (
                <tr key={k}><th>{k.replace(/_/g, " ")}</th><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_ICONS } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({ where: { featured: true }, take: 4 }),
    prisma.product.groupBy({ by: ["category"], _count: true, orderBy: { category: "asc" } }),
  ]);

  return (
    <>
      <section className="hero">
        <h1>Le bon ordinateur, au bon prix.</h1>
        <p>Portables, PC gamer, écrans et accessoires sélectionnés et testés par nos experts.</p>
        <Link href="/produits" className="btn btn-primary">Voir le catalogue</Link>
      </section>

      <h2 className="section-title">Catégories</h2>
      <div className="categories">
        {categories.map((c) => (
          <Link key={c.category} href={`/produits?categorie=${encodeURIComponent(c.category)}`} className="category">
            <span className="category-icon">{CATEGORY_ICONS[c.category] ?? "🖥️"}</span>
            <span>{c.category}</span>
            <span className="muted small">{c._count} produits</span>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Nos coups de cœur</h2>
      <div className="grid">
        {featured.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}

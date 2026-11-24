import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  pertinence: { featured: "desc" },
  "prix-asc": { priceCents: "asc" },
  "prix-desc": { priceCents: "desc" },
  nom: { name: "asc" },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { q, categorie, tri = "pertinence" } = await searchParams;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        category: categorie || undefined,
        ...(q ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }] } : {}),
      },
      orderBy: SORTS[tri] ?? SORTS.pertinence,
    }),
    prisma.product.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
  ]);

  const link = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { q, categorie, tri, ...params };
    Object.entries(merged).forEach(([k, v]) => v && sp.set(k, v));
    return `/produits?${sp}`;
  };

  return (
    <>
      <h1>{q ? `Résultats pour « ${q} »` : categorie ?? "Tout le catalogue"}</h1>
      <div className="toolbar">
        <div className="chips">
          <Link href={link({ categorie: undefined })} className={!categorie ? "chip active" : "chip"}>Tout</Link>
          {categories.map(({ category }) => (
            <Link key={category} href={link({ categorie: category })} className={categorie === category ? "chip active" : "chip"}>
              {category}
            </Link>
          ))}
        </div>
        <form className="sort">
          {q && <input type="hidden" name="q" value={q} />}
          {categorie && <input type="hidden" name="categorie" value={categorie} />}
          <label className="muted small">
            Trier par{" "}
            <select name="tri" defaultValue={tri}>
              <option value="pertinence">Pertinence</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="nom">Nom</option>
            </select>
          </label>
          <button className="btn btn-sm">OK</button>
        </form>
      </div>
      {products.length === 0 ? (
        <p className="empty">Aucun produit ne correspond à votre recherche.</p>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </>
  );
}

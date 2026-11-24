import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { formatPrice, STATUS_LABELS } from "@/lib/format";
import { logout, updateOrderStatus, updateProduct } from "./actions";
import { LoginForm, NewProductForm } from "./forms";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;

  const [orders, products, revenue] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { items: true } }),
    prisma.product.findMany({ orderBy: { category: "asc" } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true, where: { status: { in: ["PAID", "SHIPPED"] } } }),
  ]);
  const lowStock = products.filter((p) => p.stock <= 3).length;
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <>
      <div className="toolbar">
        <h1>Tableau de bord</h1>
        <form action={logout}><button className="btn btn-sm">Déconnexion</button></form>
      </div>

      <div className="stats">
        <div className="stat"><span className="muted small">Chiffre d'affaires</span><strong>{formatPrice(revenue._sum.totalCents ?? 0)}</strong></div>
        <div className="stat"><span className="muted small">Commandes payées</span><strong>{revenue._count}</strong></div>
        <div className="stat"><span className="muted small">Produits</span><strong>{products.length}</strong></div>
        <div className="stat"><span className="muted small">Stock faible (≤ 3)</span><strong>{lowStock}</strong></div>
      </div>

      <h2 className="section-title">Commandes récentes</h2>
      {orders.length === 0 ? <p className="muted">Aucune commande pour l'instant.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td>{o.fullName}<br /><span className="muted small">{o.email}</span></td>
                  <td className="small">{o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}</td>
                  <td>{formatPrice(o.totalCents)}</td>
                  <td>
                    <form action={updateOrderStatus} className="inline-form">
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button className="btn btn-sm">OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="section-title">Produits</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Produit</th><th>Catégorie</th><th colSpan={4}>Prix (€) · Stock · Vedette</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}<br /><span className="muted small">{p.brand}</span></td>
                <td>{p.category}</td>
                <td colSpan={4}>
                  <form action={updateProduct} className="inline-form">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="price" type="number" step="0.01" min="0" defaultValue={p.priceCents / 100} className="w-num" aria-label="Prix" />
                    <input name="stock" type="number" min="0" defaultValue={p.stock} className={p.stock <= 3 ? "w-num warn" : "w-num"} aria-label="Stock" />
                    <input name="featured" type="checkbox" defaultChecked={p.featured} aria-label="Vedette" />
                    <button className="btn btn-sm">Enregistrer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Ajouter un produit</h2>
      <NewProductForm categories={categories} />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice, STATUS_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ simulation?: string }> }) {
  const { id } = await params;
  const { simulation } = await searchParams;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="confirmation">
      <h1>Merci pour votre commande, {order.fullName.split(" ")[0]} !</h1>
      <p>Commande n° <code>{order.id}</code> — statut : <strong>{STATUS_LABELS[order.status]}</strong></p>
      {simulation && <p className="notice">Mode démonstration : le paiement a été simulé (aucune clé Stripe configurée).</p>}
      <div className="summary">
        {order.items.map((i) => (
          <div className="row" key={i.id}><span>{i.quantity} × {i.name}</span><span>{formatPrice(i.priceCents * i.quantity)}</span></div>
        ))}
        {(() => {
          const shipping = order.totalCents - order.items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
          return <div className="row"><span>Livraison</span><span>{shipping ? formatPrice(shipping) : "Offerte"}</span></div>;
        })()}
        <div className="row total"><span>Total</span><span>{formatPrice(order.totalCents)}</span></div>
      </div>
      <p className="muted">Livraison à : {order.address}, {order.postalCode} {order.city}. Un e-mail de confirmation sera envoyé à {order.email}.</p>
      <Link href="/produits" className="btn">Continuer mes achats</Link>
    </div>
  );
}

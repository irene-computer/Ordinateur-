import { z } from "zod";
import { prisma } from "./db";
import { stripe } from "./stripe";
import { shippingFor } from "./format";

export const checkoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  address: z.string().min(3),
  city: z.string().min(1),
  postalCode: z.string().min(4).max(10),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(10) }))
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Crée la commande à partir des prix en base (jamais ceux envoyés par le client),
 * puis renvoie l'URL de paiement Stripe — ou, sans Stripe configuré, valide la commande en mode simulation.
 */
export async function createCheckout(input: CheckoutInput, siteUrl: string) {
  const ids = input.items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({ where: { id: { in: ids } } });

  const lines = input.items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.productId);
    if (!product) throw new CheckoutError("Produit introuvable");
    if (product.stock < item.quantity) throw new CheckoutError(`Stock insuffisant pour ${product.name}`);
    return { product, quantity: item.quantity };
  });

  const subtotalCents = lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0);
  const shippingCents = shippingFor(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  const order = await prisma.order.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      totalCents,
      items: {
        create: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          priceCents: l.product.priceCents,
          quantity: l.quantity,
        })),
      },
    },
  });

  if (!stripe) {
    await markOrderPaid(order.id);
    return { orderId: order.id, url: `${siteUrl}/commande/${order.id}?simulation=1` };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "eur",
        unit_amount: l.product.priceCents,
        product_data: { name: l.product.name },
      },
    })),
    ...(shippingCents
      ? { shipping_options: [{ shipping_rate_data: { display_name: "Livraison", type: "fixed_amount" as const, fixed_amount: { amount: shippingCents, currency: "eur" } } }] }
      : {}),
    metadata: { orderId: order.id },
    success_url: `${siteUrl}/commande/${order.id}`,
    cancel_url: `${siteUrl}/panier`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  return { orderId: order.id, url: session.url! };
}

/** Passe la commande à PAID et décrémente le stock (idempotent). */
export async function markOrderPaid(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.status !== "PENDING") return;
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    }
  });
}

export class CheckoutError extends Error {}

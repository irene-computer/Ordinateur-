import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "Non configuré" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) await markOrderPaid(orderId);
  }
  return NextResponse.json({ received: true });
}

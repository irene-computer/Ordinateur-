import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema, createCheckout, CheckoutError } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations de commande invalides" }, { status: 400 });
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  try {
    const result = await createCheckout(parsed.data, siteUrl);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "Erreur lors de la commande" }, { status: 500 });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

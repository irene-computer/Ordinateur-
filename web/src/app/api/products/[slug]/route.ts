import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSpecs } from "@/lib/format";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json({ ...product, specs: parseSpecs(product.specs) });
}

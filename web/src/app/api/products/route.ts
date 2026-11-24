import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSpecs } from "@/lib/format";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const products = await prisma.product.findMany({
    where: {
      category,
      ...(q ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }] } : {}),
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(products.map((p) => ({ ...p, specs: parseSpecs(p.specs) })));
}

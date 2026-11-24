import { PrismaClient } from "@prisma/client";
import { products } from "./products";

const prisma = new PrismaClient();

async function main() {
  for (const p of products) {
    const data = { ...p, specs: JSON.stringify(p.specs), featured: p.featured ?? false };
    await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: data });
  }
  console.log(`${products.length} produits insérés.`);
}

main().finally(() => prisma.$disconnect());

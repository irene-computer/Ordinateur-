"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}

export async function login(_prev: string | null, formData: FormData) {
  if (!checkPassword(String(formData.get("password") ?? ""))) return "Mot de passe incorrect";
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const status = z.enum(["PENDING", "PAID", "SHIPPED", "CANCELLED"]).parse(formData.get("status"));
  await prisma.order.update({ where: { id: String(formData.get("id")) }, data: { status } });
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ price: z.coerce.number().min(0), stock: z.coerce.number().int().min(0), featured: z.boolean() })
    .parse({ price: formData.get("price"), stock: formData.get("stock"), featured: formData.get("featured") === "on" });
  await prisma.product.update({
    where: { id: String(formData.get("id")) },
    data: { priceCents: Math.round(data.price * 100), stock: data.stock, featured: data.featured },
  });
  revalidatePath("/", "layout");
}

const newProductSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  description: z.string().min(5),
  specs: z.string(),
});

export async function createProduct(_prev: string | null, formData: FormData) {
  await requireAdmin();
  const parsed = newProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return "Champs invalides";
  const { name, brand, category, price, stock, description, specs } = parsed.data;

  // Specs saisies au format « Clé: valeur » une par ligne
  const specsObj = Object.fromEntries(
    specs.split("\n").map((l) => l.split(":")).filter((p) => p.length >= 2).map(([k, ...v]) => [k.trim(), v.join(":").trim()]),
  );
  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (await prisma.product.findUnique({ where: { slug } })) return "Un produit avec ce nom existe déjà";

  await prisma.product.create({
    data: { slug, name, brand, category, priceCents: Math.round(price * 100), stock, description, specs: JSON.stringify(specsObj) },
  });
  revalidatePath("/", "layout");
  return "Produit créé ✓";
}

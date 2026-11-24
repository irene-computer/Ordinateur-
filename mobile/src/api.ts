// URL de l'API du site web (dossier ../web).
// Sur un téléphone physique, remplacez localhost par l'IP de votre ordinateur, ex. http://192.168.1.20:3000
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  description: string;
  specs: Record<string, string>;
  stock: number;
  featured: boolean;
};

export type CheckoutInput = {
  email: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  items: { productId: string; quantity: number }[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur réseau");
  return data as T;
}

export const api = {
  products: (params: { q?: string; category?: string } = {}) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    return request<Product[]>(`/api/products?${sp}`);
  },
  product: (slug: string) => request<Product>(`/api/products/${slug}`),
  checkout: (input: CheckoutInput) =>
    request<{ orderId: string; url: string }>("/api/checkout", { method: "POST", body: JSON.stringify(input) }),
};

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export const shippingFor = (subtotalCents: number) => (subtotalCents >= 50000 ? 0 : 990);

export const CATEGORY_ICONS: Record<string, string> = {
  Portables: "💻",
  Gaming: "🎮",
  Bureau: "🖥️",
  Écrans: "🖵",
  Accessoires: "⌨️",
  Composants: "💾",
};

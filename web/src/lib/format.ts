export function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function parseSpecs(specs: string): Record<string, string> {
  try {
    return JSON.parse(specs);
  } catch {
    return {};
  }
}

export const CATEGORY_ICONS: Record<string, string> = {
  Portables: "💻",
  Gaming: "🎮",
  Bureau: "🖥️",
  Écrans: "🖵",
  Accessoires: "⌨️",
  Composants: "💾",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  CANCELLED: "Annulée",
};

/** Livraison offerte dès 500 €, sinon 9,90 € — utilisé côté client ET serveur. */
export function shippingFor(subtotalCents: number) {
  return subtotalCents >= 50000 ? 0 : 990;
}

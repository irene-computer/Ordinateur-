// Catalogue de démonstration — partagé entre le seed et la démo statique
export type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  description: string;
  specs: Record<string, string>;
  stock: number;
  featured?: boolean;
};

export const products: SeedProduct[] = [
  {
    slug: "zenbook-14-oled",
    name: "ZenBook 14 OLED",
    brand: "Asus",
    category: "Portables",
    priceCents: 109900,
    description: "Ultraportable léger avec écran OLED 2,8K, idéal pour le travail et le multimédia.",
    specs: { Processeur: "Intel Core Ultra 7 155H", RAM: "16 Go", Stockage: "1 To SSD", Écran: '14" OLED 2,8K 120 Hz', Poids: "1,2 kg" },
    stock: 12,
    featured: true,
  },
  {
    slug: "macbook-air-13-m4",
    name: "MacBook Air 13\" M4",
    brand: "Apple",
    category: "Portables",
    priceCents: 129900,
    description: "Silencieux, autonomie record et puce M4 pour une fluidité au quotidien.",
    specs: { Processeur: "Apple M4 10 cœurs", RAM: "16 Go", Stockage: "512 Go SSD", Écran: '13,6" Liquid Retina', Autonomie: "18 h" },
    stock: 8,
    featured: true,
  },
  {
    slug: "thinkpad-t14-gen5",
    name: "ThinkPad T14 Gen 5",
    brand: "Lenovo",
    category: "Portables",
    priceCents: 139900,
    description: "Le portable professionnel robuste, clavier de référence et sécurité avancée.",
    specs: { Processeur: "AMD Ryzen 7 PRO 8840U", RAM: "32 Go", Stockage: "1 To SSD", Écran: '14" WUXGA IPS', Garantie: "3 ans sur site" },
    stock: 5,
  },
  {
    slug: "legion-pro-5",
    name: "Legion Pro 5",
    brand: "Lenovo",
    category: "Gaming",
    priceCents: 179900,
    description: "PC portable gamer avec RTX 4070 et écran 240 Hz pour jouer en très haute fréquence.",
    specs: { Processeur: "Intel Core i9-14900HX", GPU: "NVIDIA RTX 4070 8 Go", RAM: "32 Go DDR5", Stockage: "1 To SSD", Écran: '16" WQXGA 240 Hz' },
    stock: 4,
    featured: true,
  },
  {
    slug: "pc-gamer-atlas",
    name: "PC Gamer Atlas",
    brand: "Ordinateur+",
    category: "Gaming",
    priceCents: 219900,
    description: "Tour assemblée et testée dans nos ateliers, refroidissement liquide, prête à jouer en 4K.",
    specs: { Processeur: "AMD Ryzen 7 9800X3D", GPU: "NVIDIA RTX 5080 16 Go", RAM: "32 Go DDR5 6000", Stockage: "2 To NVMe", Alimentation: "850 W 80+ Gold" },
    stock: 3,
  },
  {
    slug: "imac-24-m4",
    name: "iMac 24\" M4",
    brand: "Apple",
    category: "Bureau",
    priceCents: 159900,
    description: "Tout-en-un fin et coloré avec écran 4,5K, parfait pour la maison.",
    specs: { Processeur: "Apple M4 8 cœurs", RAM: "16 Go", Stockage: "256 Go SSD", Écran: '24" Retina 4,5K' },
    stock: 6,
  },
  {
    slug: "mini-pc-nuc-14",
    name: "Mini PC NUC 14 Pro",
    brand: "Asus",
    category: "Bureau",
    priceCents: 69900,
    description: "Puissance de bureau dans un boîtier de la taille d'une main.",
    specs: { Processeur: "Intel Core Ultra 5 125H", RAM: "16 Go", Stockage: "512 Go SSD", Connectique: "Thunderbolt 4, HDMI 2.1" },
    stock: 15,
  },
  {
    slug: "ecran-ultrasharp-27-4k",
    name: "UltraSharp 27\" 4K",
    brand: "Dell",
    category: "Écrans",
    priceCents: 54900,
    description: "Moniteur 4K IPS calibré en usine, hub USB-C 90 W intégré.",
    specs: { Taille: '27"', Définition: "3840 × 2160", Dalle: "IPS Black", Connectique: "USB-C 90 W, HDMI, DP" },
    stock: 10,
  },
  {
    slug: "odyssey-g7-32",
    name: "Odyssey G7 32\"",
    brand: "Samsung",
    category: "Écrans",
    priceCents: 49900,
    description: "Écran incurvé QHD 240 Hz pour une immersion totale en jeu.",
    specs: { Taille: '32" incurvé 1000R', Définition: "2560 × 1440", Fréquence: "240 Hz", Temps_de_réponse: "1 ms" },
    stock: 7,
  },
  {
    slug: "clavier-mx-keys-s",
    name: "MX Keys S",
    brand: "Logitech",
    category: "Accessoires",
    priceCents: 11900,
    description: "Clavier sans fil rétroéclairé, multi-appareils, frappe silencieuse.",
    specs: { Connexion: "Bluetooth / Logi Bolt", Autonomie: "10 jours (rétroéclairé)", Compatibilité: "Windows, macOS, Linux" },
    stock: 30,
  },
  {
    slug: "souris-mx-master-3s",
    name: "MX Master 3S",
    brand: "Logitech",
    category: "Accessoires",
    priceCents: 9900,
    description: "Souris ergonomique de précision, molette électromagnétique ultra-rapide.",
    specs: { Capteur: "8000 DPI", Connexion: "Bluetooth / Logi Bolt", Autonomie: "70 jours" },
    stock: 40,
  },
  {
    slug: "ssd-990-pro-2to",
    name: "SSD 990 PRO 2 To",
    brand: "Samsung",
    category: "Composants",
    priceCents: 17900,
    description: "SSD NVMe PCIe 4.0 parmi les plus rapides du marché.",
    specs: { Capacité: "2 To", Interface: "PCIe 4.0 x4 NVMe", Lecture: "7450 Mo/s", Écriture: "6900 Mo/s" },
    stock: 25,
  },
];

import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordinateur+ — Ordinateurs et high-tech",
  description: "Portables, PC gamer, écrans et accessoires livrés rapidement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <Header />
          <main className="container main">{children}</main>
          <footer className="footer">
            <div className="container">
              © {new Date().getFullYear()} Ordinateur+ · Livraison offerte dès 500 € · Retours sous 30 jours
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

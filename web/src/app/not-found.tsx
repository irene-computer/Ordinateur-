import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <h1>Page introuvable</h1>
      <Link href="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  );
}

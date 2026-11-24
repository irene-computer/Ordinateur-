"use client";

import { useActionState } from "react";
import { createProduct, login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="form narrow">
      <h1>Administration</h1>
      <label>Mot de passe<input name="password" type="password" required autoFocus /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={pending}>Se connecter</button>
    </form>
  );
}

export function NewProductForm({ categories }: { categories: string[] }) {
  const [message, action, pending] = useActionState(createProduct, null);
  return (
    <form action={action} className="form">
      <div className="form-row">
        <label>Nom<input name="name" required /></label>
        <label>Marque<input name="brand" required /></label>
      </div>
      <div className="form-row">
        <label>
          Catégorie
          <input name="category" list="categories" required />
          <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label>Prix (€)<input name="price" type="number" step="0.01" min="0" required /></label>
        <label>Stock<input name="stock" type="number" min="0" defaultValue={0} required /></label>
      </div>
      <label>Description<textarea name="description" rows={2} required /></label>
      <label>Caractéristiques (une par ligne, « Clé: valeur »)<textarea name="specs" rows={3} placeholder={"Processeur: Intel Core i5\nRAM: 16 Go"} /></label>
      {message && <p className={message.includes("✓") ? "success" : "error"}>{message}</p>}
      <button className="btn btn-primary" disabled={pending}>Ajouter le produit</button>
    </form>
  );
}

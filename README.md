# Ordinateur+ — boutique e-commerce d'ordinateurs

Monorepo contenant trois parties :

| Dossier   | Contenu |
|-----------|---------|
| `web/`    | Application full-stack **Next.js 15** : boutique, panier, commande, paiement **Stripe**, espace **admin**, API REST |
| `mobile/` | Application mobile **Expo / React Native** (iOS, Android, web) branchée sur l'API de `web/` |
| `demo/`   | Démo statique autonome (un seul fichier HTML, paiement simulé) |

## 1. Site web (`web/`)

```bash
cd web
npm install
cp .env.example .env      # puis modifiez ADMIN_PASSWORD et SESSION_SECRET
npm run setup             # crée la base SQLite et insère 12 produits
npm run dev               # http://localhost:3000
```

Fonctionnalités :

- Catalogue avec catégories, recherche, tri et fiches techniques
- Panier sauvegardé dans le navigateur, livraison offerte dès 500 € (sinon 9,90 €)
- Commande : les prix sont recalculés côté serveur, le stock est vérifié puis décrémenté au paiement
- Paiement **Stripe Checkout** si `STRIPE_SECRET_KEY` est renseignée, sinon paiement **simulé**
- Webhook Stripe : `POST /api/stripe/webhook` (événement `checkout.session.completed`)
- `/admin` (mot de passe `ADMIN_PASSWORD`) : chiffre d'affaires, commandes et changement de statut, prix/stock/vedette, ajout de produits

API utilisée par l'app mobile :

| Méthode | Route | Rôle |
|---------|-------|------|
| GET  | `/api/products?q=&category=` | Liste des produits |
| GET  | `/api/products/:slug` | Détail d'un produit |
| POST | `/api/checkout` | Crée la commande et renvoie l'URL de paiement |

### Activer Stripe

1. Créez un compte sur stripe.com et copiez la clé secrète de test (`sk_test_…`) dans `STRIPE_SECRET_KEY`.
2. En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`, puis copiez le `whsec_…` dans `STRIPE_WEBHOOK_SECRET`.
3. Carte de test : `4242 4242 4242 4242`.

### Mise en production

SQLite convient pour démarrer. Pour un hébergement type Vercel, passez à PostgreSQL : changez `provider = "postgresql"` dans `prisma/schema.prisma` et mettez l'URL de la base dans `DATABASE_URL`.

## 2. Application mobile (`mobile/`)

```bash
cd mobile
npm install
npx expo start            # scannez le QR code avec l'app Expo Go
```

Le site web doit tourner en parallèle. Sur un téléphone physique, indiquez l'IP de votre ordinateur :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start
```

## 3. Démo (`demo/`)

Ouvrez `demo/index.html` dans un navigateur : aucune installation nécessaire.

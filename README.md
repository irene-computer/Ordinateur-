# Ordinateur+ — boutique e-commerce d'ordinateurs

Monorepo contenant quatre parties. Le cahier des charges complet décrit la version **Django**.

| Dossier   | Contenu |
|-----------|---------|
| `django-shop/` | **Version principale — Django 5** : boutique, comptes clients, panier, commande, paiement **Stripe**, back-office Django, API REST (DRF) |
| `web/`    | Prototype équivalent en **Next.js 15** |
| `mobile/` | Application mobile **Expo / React Native** (iOS, Android, web) branchée sur l'API de `web/` |
| `demo/`   | Démo statique autonome (un seul fichier HTML, paiement simulé) |

## 1. Boutique Django (`django-shop/`)

```bash
cd django-shop
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # puis changez SECRET_KEY
python manage.py migrate
python manage.py seed_products     # 12 produits de démonstration
python manage.py createsuperuser   # compte du back-office
python manage.py runserver         # http://localhost:8000  ·  back-office : /admin/
python manage.py test              # 11 tests (prix, stock, paiement, API)
```

| Application | Rôle |
|-------------|------|
| `catalog`  | Catégories, marques, produits, recherche, filtres, tri |
| `cart`     | Panier en session, frais de port (9,90 €, offerts dès 500 €) |
| `orders`   | Commandes, Stripe Checkout, webhook, e-mails, actions « en préparation » / « expédiée » |
| `accounts` | Inscription, connexion, historique des commandes |
| `api`      | API REST pour l'app mobile (`/api/products`, `/api/products/<slug>`, `/api/categories`, `/api/checkout`, `/api/auth/token`, `/api/orders`, `/api/stripe/webhook`) |

- Les prix sont toujours recalculés par le serveur ; le stock est vérifié à la commande et décrémenté au paiement (webhook rejoué sans effet).
- Paiement **simulé** tant que `STRIPE_SECRET_KEY` est vide.
- Back-office : tableau de bord (CA du mois, commandes à expédier, stock faible), prix et stock modifiables directement dans la liste des produits.
- Production : `DEBUG=0`, `DATABASE_URL=postgres://…`, `python manage.py collectstatic`, puis `gunicorn config.wsgi`.

## 1 bis. Prototype Next.js (`web/`)

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

Le serveur Django doit tourner en parallèle (port 8000 par défaut). Sur un téléphone physique, indiquez l'IP de votre ordinateur et lancez Django avec `runserver 0.0.0.0:8000` :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:8000 npx expo start
```

Pour utiliser le prototype Next.js à la place : `EXPO_PUBLIC_API_URL=http://localhost:3000`.

## 3. Démo (`demo/`)

Ouvrez `demo/index.html` dans un navigateur : aucune installation nécessaire.

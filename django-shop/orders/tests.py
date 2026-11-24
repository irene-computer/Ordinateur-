from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase, override_settings

from catalog.models import Product
from orders.models import Order
from orders.services import CheckoutError, Customer, create_order, mark_paid

CUSTOMER = Customer(email="lea@example.com", full_name="Léa Martin", address="3 av. X", postal_code="33000", city="Bordeaux")


@override_settings(STRIPE_SECRET_KEY="", STRIPE_WEBHOOK_SECRET="")
class OrderTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_products", verbosity=0)
        cls.mouse = Product.objects.get(slug="souris-mx-master-3s")  # 99 €
        cls.laptop = Product.objects.get(slug="legion-pro-5")  # 1 799 €, stock 4

    def test_shipping_charged_below_threshold(self):
        order = create_order(CUSTOMER, [(self.mouse.pk, 1)])
        self.assertEqual(order.subtotal_cents, 9900)
        self.assertEqual(order.shipping_cents, 990)
        self.assertEqual(order.total_cents, 10890)

    def test_free_shipping_above_threshold(self):
        order = create_order(CUSTOMER, [(self.laptop.pk, 1)])
        self.assertEqual(order.shipping_cents, 0)

    def test_insufficient_stock_rejected(self):
        with self.assertRaises(CheckoutError):
            create_order(CUSTOMER, [(self.laptop.pk, 5)])

    def test_mark_paid_is_idempotent(self):
        order = create_order(CUSTOMER, [(self.laptop.pk, 2)])
        self.assertTrue(mark_paid(order.pk))
        self.assertFalse(mark_paid(order.pk))  # webhook rejoué
        self.laptop.refresh_from_db()
        self.assertEqual(self.laptop.stock, 2)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PAID)

    def test_web_checkout_flow(self):
        self.client.post(f"/panier/ajouter/{self.mouse.pk}/")
        response = self.client.post("/commande/", {
            "full_name": "Léa Martin", "email": "lea@example.com", "address": "3 av. X",
            "postal_code": "33000", "city": "Bordeaux", "accept_terms": "on",
        })
        order = Order.objects.get()
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.endswith(f"/commande/{order.public_id}/?simulation=1"))
        self.assertEqual(order.status, Order.Status.PAID)
        self.assertEqual(self.client.session["cart"], {})

    def test_checkout_requires_terms(self):
        self.client.post(f"/panier/ajouter/{self.mouse.pk}/")
        response = self.client.post("/commande/", {
            "full_name": "Léa", "email": "lea@example.com", "address": "3 av. X", "postal_code": "33000", "city": "Bordeaux",
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Order.objects.exists())

    def test_api_products_shape(self):
        data = self.client.get("/api/products?q=lenovo").json()
        self.assertEqual(len(data), 2)
        self.assertEqual(set(data[0]), {"id", "slug", "name", "brand", "category", "priceCents", "description", "specs", "stock", "featured"})
        self.assertEqual(self.client.get("/api/products", headers={"Origin": "http://x"})["Access-Control-Allow-Origin"], "*")

    def test_api_checkout_ignores_client_price(self):
        response = self.client.post("/api/checkout", {
            "email": "a@b.fr", "fullName": "Ana B", "address": "2 rue X", "city": "Lyon", "postalCode": "69001",
            "items": [{"productId": self.mouse.pk, "quantity": 1, "priceCents": 1}],
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Order.objects.get().total_cents, 10890)

    def test_api_checkout_invalid(self):
        response = self.client.post("/api/checkout", {"email": "bad"}, content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_customer_sees_own_orders(self):
        user = User.objects.create_user("lea@example.com", "lea@example.com", "motdepasse-solide-42")
        create_order(CUSTOMER, [(self.mouse.pk, 1)], user=user)
        self.client.force_login(user)
        self.assertContains(self.client.get("/compte/commandes/"), "MX Master 3S")

    @override_settings(STRIPE_SECRET_KEY="sk_test_x", STRIPE_WEBHOOK_SECRET="whsec_x")
    def test_webhook_rejects_bad_signature(self):
        response = self.client.post("/api/stripe/webhook/", b"{}", content_type="application/json", headers={"Stripe-Signature": "t=1,v1=bad"})
        self.assertEqual(response.status_code, 400)

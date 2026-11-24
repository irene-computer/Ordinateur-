"""Logique métier des commandes : création, paiement, validation."""
from dataclasses import dataclass

import stripe
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

from cart.cart import shipping_for
from catalog.models import Product

from .models import Order, OrderItem


class CheckoutError(Exception):
    pass


@dataclass
class Customer:
    email: str
    full_name: str
    address: str
    postal_code: str
    city: str


@transaction.atomic
def create_order(customer: Customer, items: list[tuple[int, int]], user=None) -> Order:
    """items = [(product_id, quantité)]. Les prix viennent de la base, jamais du client."""
    if not items:
        raise CheckoutError("Le panier est vide.")
    products = {p.pk: p for p in Product.objects.filter(pk__in=[pid for pid, _ in items], is_active=True)}
    lines = []
    for product_id, quantity in items:
        product = products.get(int(product_id))
        if product is None:
            raise CheckoutError("Un produit du panier n'est plus disponible.")
        if not 1 <= quantity <= 10:
            raise CheckoutError("Quantité invalide.")
        if product.stock < quantity:
            raise CheckoutError(f"Stock insuffisant pour {product.name}.")
        lines.append((product, quantity))

    subtotal = sum(p.price_cents * q for p, q in lines)
    shipping = shipping_for(subtotal)
    order = Order.objects.create(
        user=user if user and user.is_authenticated else None,
        **customer.__dict__,
        subtotal_cents=subtotal,
        shipping_cents=shipping,
        total_cents=subtotal + shipping,
    )
    OrderItem.objects.bulk_create(
        OrderItem(order=order, product=p, name=p.name, price_cents=p.price_cents, quantity=q) for p, q in lines
    )
    return order


def start_payment(order: Order) -> str:
    """Renvoie l'URL où envoyer le client : Stripe Checkout, ou la confirmation en mode simulation."""
    confirm_url = f"{settings.SITE_URL}/commande/{order.public_id}/"
    if not settings.STRIPE_SECRET_KEY:
        mark_paid(order.pk)
        return confirm_url + "?simulation=1"

    stripe.api_key = settings.STRIPE_SECRET_KEY
    line_items = [
        {
            "quantity": item.quantity,
            "price_data": {"currency": "eur", "unit_amount": item.price_cents, "product_data": {"name": item.name}},
        }
        for item in order.items.all()
    ]
    params = {
        "mode": "payment",
        "customer_email": order.email,
        "line_items": line_items,
        "metadata": {"order_id": str(order.pk)},
        "success_url": confirm_url,
        "cancel_url": f"{settings.SITE_URL}/panier/",
    }
    if order.shipping_cents:
        params["shipping_options"] = [{
            "shipping_rate_data": {
                "display_name": "Livraison",
                "type": "fixed_amount",
                "fixed_amount": {"amount": order.shipping_cents, "currency": "eur"},
            }
        }]
    session = stripe.checkout.Session.create(**params)
    order.stripe_session_id = session.id
    order.save(update_fields=["stripe_session_id"])
    return session.url


def mark_paid(order_id: int) -> bool:
    """Passe la commande à « Payée » et décrémente le stock. Idempotent (webhook rejoué)."""
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(pk=order_id).first()
        if order is None or order.status != Order.Status.PENDING:
            return False
        for item in order.items.select_related("product"):
            product = Product.objects.select_for_update().get(pk=item.product_id)
            product.stock = max(0, product.stock - item.quantity)
            product.save(update_fields=["stock"])
        order.status = Order.Status.PAID
        order.save(update_fields=["status"])

    send_mail(
        f"Confirmation de votre commande {order.number}",
        f"Bonjour {order.full_name},\n\nNous avons bien reçu le paiement de votre commande {order.number} "
        f"({order.total_cents / 100:.2f} €).\nElle sera expédiée sous 48 h.\n\nL'équipe Ordinateur+",
        None,
        [order.email],
        fail_silently=True,
    )
    return True

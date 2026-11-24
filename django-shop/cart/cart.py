"""Panier stocké en session : {product_id: quantité}."""
from django.conf import settings

from catalog.models import Product

SESSION_KEY = "cart"
MAX_QTY = 10


def shipping_for(subtotal_cents: int) -> int:
    return 0 if subtotal_cents >= settings.FREE_SHIPPING_THRESHOLD_CENTS else settings.SHIPPING_CENTS


class Cart:
    def __init__(self, request):
        self.session = request.session
        self.data: dict[str, int] = self.session.get(SESSION_KEY, {})

    def save(self):
        self.session[SESSION_KEY] = self.data
        self.session.modified = True

    def add(self, product: Product, quantity: int = 1):
        key = str(product.pk)
        self.data[key] = max(1, min(MAX_QTY, product.stock, self.data.get(key, 0) + quantity))
        self.save()

    def set(self, product_id: int, quantity: int):
        key = str(product_id)
        if quantity <= 0:
            self.data.pop(key, None)
        elif key in self.data:
            self.data[key] = min(MAX_QTY, quantity)
        self.save()

    def clear(self):
        self.data = {}
        self.save()

    def lines(self):
        products = Product.objects.filter(pk__in=self.data.keys(), is_active=True).select_related("category")
        return [
            {"product": p, "quantity": self.data[str(p.pk)], "total_cents": p.price_cents * self.data[str(p.pk)]}
            for p in products
        ]

    @property
    def count(self):
        return sum(self.data.values())

    def summary(self):
        lines = self.lines()
        subtotal = sum(l["total_cents"] for l in lines)
        shipping = shipping_for(subtotal) if lines else 0
        return {"lines": lines, "subtotal": subtotal, "shipping": shipping, "total": subtotal + shipping}

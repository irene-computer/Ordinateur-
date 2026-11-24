import uuid

from django.conf import settings
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente de paiement"
        PAID = "PAID", "Payée"
        PREPARING = "PREPARING", "En préparation"
        SHIPPED = "SHIPPED", "Expédiée"
        DELIVERED = "DELIVERED", "Livrée"
        CANCELLED = "CANCELLED", "Annulée"
        REFUNDED = "REFUNDED", "Remboursée"

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    email = models.EmailField("e-mail")
    full_name = models.CharField("nom complet", max_length=150)
    address = models.CharField("adresse", max_length=255)
    postal_code = models.CharField("code postal", max_length=10)
    city = models.CharField("ville", max_length=100)
    subtotal_cents = models.PositiveIntegerField("sous-total (centimes)")
    shipping_cents = models.PositiveIntegerField("livraison (centimes)")
    total_cents = models.PositiveIntegerField("total (centimes)")
    status = models.CharField("statut", max_length=12, choices=Status.choices, default=Status.PENDING)
    tracking_number = models.CharField("n° de suivi", max_length=64, blank=True)
    stripe_session_id = models.CharField(max_length=255, blank=True, db_index=True)
    created_at = models.DateTimeField("date", auto_now_add=True)

    class Meta:
        verbose_name = "commande"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Commande {self.number}"

    @property
    def number(self):
        return f"OP-{self.pk:06d}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalog.Product", on_delete=models.PROTECT, related_name="order_items")
    # Nom et prix figés au moment de l'achat
    name = models.CharField("produit", max_length=200)
    price_cents = models.PositiveIntegerField("prix unitaire (centimes)")
    quantity = models.PositiveIntegerField("quantité")

    class Meta:
        verbose_name = "ligne de commande"

    @property
    def total_cents(self):
        return self.price_cents * self.quantity

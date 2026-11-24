from rest_framework import serializers

from catalog.models import Category, Product
from orders.models import Order


class ProductSerializer(serializers.ModelSerializer):
    """Même format JSON que l'app mobile attend (camelCase)."""

    brand = serializers.CharField(source="brand.name")
    category = serializers.CharField(source="category.name")
    priceCents = serializers.IntegerField(source="price_cents")

    class Meta:
        model = Product
        fields = ["id", "slug", "name", "brand", "category", "priceCents", "description", "specs", "stock", "featured"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "slug", "name", "icon", "parent"]


class CheckoutSerializer(serializers.Serializer):
    email = serializers.EmailField()
    fullName = serializers.CharField(max_length=150, min_length=2)
    address = serializers.CharField(max_length=255, min_length=3)
    city = serializers.CharField(max_length=100)
    postalCode = serializers.RegexField(r"^\d{5}$")
    items = serializers.ListField(
        child=serializers.DictField(), min_length=1, max_length=50
    )

    def validate_items(self, items):
        try:
            return [(int(i["productId"]), int(i["quantity"])) for i in items]
        except (KeyError, TypeError, ValueError):
            raise serializers.ValidationError("Articles invalides.")


class OrderSerializer(serializers.ModelSerializer):
    number = serializers.CharField()
    status = serializers.CharField(source="get_status_display")
    totalCents = serializers.IntegerField(source="total_cents")
    createdAt = serializers.DateTimeField(source="created_at")
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["number", "status", "totalCents", "createdAt", "items"]

    def get_items(self, order):
        return [{"name": i.name, "quantity": i.quantity, "priceCents": i.price_cents} for i in order.items.all()]

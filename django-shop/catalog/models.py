from django.db import models
from django.urls import reverse


class Category(models.Model):
    name = models.CharField("nom", max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField("icône", max_length=8, blank=True, help_text="Emoji affiché sur le site")
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="children")

    class Meta:
        verbose_name = "catégorie"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField("nom", max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = "marque"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField("nom", max_length=200)
    slug = models.SlugField(unique=True)
    sku = models.CharField("référence", max_length=64, blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products", verbose_name="catégorie")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products", verbose_name="marque")
    price_cents = models.PositiveIntegerField("prix TTC (centimes)")
    compare_at_cents = models.PositiveIntegerField("prix barré (centimes)", null=True, blank=True)
    description = models.TextField()
    specs = models.JSONField("caractéristiques", default=dict, blank=True)
    stock = models.PositiveIntegerField(default=0)
    featured = models.BooleanField("coup de cœur", default=False)
    is_active = models.BooleanField("en vente", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "produit"
        ordering = ["-featured", "name"]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("catalog:product", args=[self.slug])

    @property
    def price(self):
        return self.price_cents / 100

    @property
    def stock_label(self):
        if self.stock <= 0:
            return "Rupture de stock"
        if self.stock <= 5:
            return f"Plus que {self.stock} en stock"
        return "En stock"

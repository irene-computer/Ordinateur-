import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from catalog.models import Brand, Category, Product

ICONS = {"Portables": "💻", "Gaming": "🎮", "Bureau": "🖥️", "Écrans": "🖵", "Accessoires": "⌨️", "Composants": "💾"}


class Command(BaseCommand):
    help = "Insère (ou met à jour) le catalogue de démonstration."

    def handle(self, *args, **options):
        data = json.loads((Path(__file__).resolve().parents[2] / "fixtures" / "products.json").read_text())
        for p in data:
            category, _ = Category.objects.get_or_create(
                slug=slugify(p["category"]), defaults={"name": p["category"], "icon": ICONS.get(p["category"], "")}
            )
            brand, _ = Brand.objects.get_or_create(slug=slugify(p["brand"]), defaults={"name": p["brand"]})
            Product.objects.update_or_create(
                slug=p["slug"],
                defaults={
                    "name": p["name"], "category": category, "brand": brand, "price_cents": p["priceCents"],
                    "description": p["description"], "specs": p["specs"], "stock": p["stock"],
                    "featured": p.get("featured", False),
                },
            )
        self.stdout.write(self.style.SUCCESS(f"{len(data)} produits insérés."))

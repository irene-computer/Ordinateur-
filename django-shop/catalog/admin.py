from django.contrib import admin
from django.conf import settings

from .models import Brand, Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "icon", "parent"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ["name"]
    prepopulated_fields = {"slug": ["name"]}
    search_fields = ["name"]


class LowStockFilter(admin.SimpleListFilter):
    title = "stock"
    parameter_name = "stock"

    def lookups(self, request, model_admin):
        return [("low", f"Faible (≤ {settings.LOW_STOCK_THRESHOLD})"), ("out", "Rupture")]

    def queryset(self, request, queryset):
        if self.value() == "low":
            return queryset.filter(stock__lte=settings.LOW_STOCK_THRESHOLD)
        if self.value() == "out":
            return queryset.filter(stock=0)
        return queryset


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "brand", "category", "price_cents", "stock", "featured", "is_active"]
    list_editable = ["price_cents", "stock", "featured", "is_active"]
    list_filter = ["category", "brand", "featured", "is_active", LowStockFilter]
    search_fields = ["name", "sku", "description"]
    prepopulated_fields = {"slug": ["name"]}
    autocomplete_fields = ["brand"]

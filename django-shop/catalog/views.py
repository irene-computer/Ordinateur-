from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, render

from .models import Category, Product

SORTS = {
    "pertinence": ["-featured", "name"],
    "prix-asc": ["price_cents"],
    "prix-desc": ["-price_cents"],
    "nom": ["name"],
}


def search_products(q: str | None = None, category: str | None = None):
    qs = Product.objects.filter(is_active=True).select_related("brand", "category")
    if category:
        qs = qs.filter(Q(category__slug=category) | Q(category__name=category))
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(brand__name__icontains=q) | Q(description__icontains=q))
    return qs


def home(request):
    return render(request, "catalog/home.html", {
        "featured": Product.objects.filter(is_active=True, featured=True).select_related("brand", "category")[:4],
        "categories": Category.objects.annotate(n=Count("products", filter=Q(products__is_active=True))),
    })


def product_list(request):
    q = request.GET.get("q", "").strip()
    cat = request.GET.get("categorie", "")
    sort = request.GET.get("tri", "pertinence")
    products = search_products(q, cat).order_by(*SORTS.get(sort, SORTS["pertinence"]))
    return render(request, "catalog/list.html", {
        "products": products,
        "categories": Category.objects.all(),
        "q": q,
        "current_category": Category.objects.filter(slug=cat).first(),
        "sort": sort,
    })


def product_detail(request, slug):
    product = get_object_or_404(Product.objects.select_related("brand", "category"), slug=slug, is_active=True)
    return render(request, "catalog/detail.html", {"product": product})

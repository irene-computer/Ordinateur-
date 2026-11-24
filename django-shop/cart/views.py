from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from catalog.models import Product

from .cart import Cart


def cart_detail(request):
    return render(request, "cart/detail.html", Cart(request).summary())


@require_POST
def cart_add(request, product_id):
    product = get_object_or_404(Product, pk=product_id, is_active=True)
    if product.stock <= 0:
        messages.error(request, f"{product.name} est en rupture de stock.")
    else:
        Cart(request).add(product, int(request.POST.get("quantity", 1)))
        messages.success(request, f"{product.name} a été ajouté au panier.")
    return redirect(request.POST.get("next") or "cart:detail")


@require_POST
def cart_update(request, product_id):
    try:
        quantity = int(request.POST.get("quantity", 0))
    except ValueError:
        quantity = 0
    Cart(request).set(product_id, quantity)
    return redirect("cart:detail")

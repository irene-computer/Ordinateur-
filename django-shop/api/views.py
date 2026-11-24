from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from catalog.models import Category, Product
from catalog.views import search_products
from orders.services import CheckoutError, Customer, create_order, start_payment

from .serializers import CategorySerializer, CheckoutSerializer, OrderSerializer, ProductSerializer


@api_view(["GET"])
def products(request):
    qs = search_products(request.GET.get("q", "").strip(), request.GET.get("category"))
    return Response(ProductSerializer(qs, many=True).data)


@api_view(["GET"])
def product_detail(request, slug):
    product = get_object_or_404(Product.objects.select_related("brand", "category"), slug=slug, is_active=True)
    return Response(ProductSerializer(product).data)


@api_view(["GET"])
def categories(request):
    return Response(CategorySerializer(Category.objects.all(), many=True).data)


@api_view(["POST"])
def checkout(request):
    s = CheckoutSerializer(data=request.data)
    if not s.is_valid():
        return Response({"error": "Informations de commande invalides", "details": s.errors}, status=400)
    d = s.validated_data
    customer = Customer(email=d["email"], full_name=d["fullName"], address=d["address"], postal_code=d["postalCode"], city=d["city"])
    try:
        order = create_order(customer, d["items"], request.user)
        url = start_payment(order)
    except CheckoutError as e:
        return Response({"error": str(e)}, status=status.HTTP_409_CONFLICT)
    return Response({"orderId": order.number, "url": url})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    return Response(OrderSerializer(request.user.orders.prefetch_related("items"), many=True).data)

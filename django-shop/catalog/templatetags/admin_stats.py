from django import template
from django.conf import settings
from django.db.models import Sum
from django.utils import timezone

from catalog.models import Product
from orders.models import Order

register = template.Library()

PAID = [Order.Status.PAID, Order.Status.PREPARING, Order.Status.SHIPPED, Order.Status.DELIVERED]


@register.inclusion_tag("admin/_stats.html")
def shop_stats():
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    paid = Order.objects.filter(status__in=PAID)
    return {
        "revenue_month": paid.filter(created_at__gte=month_start).aggregate(s=Sum("total_cents"))["s"] or 0,
        "orders_month": paid.filter(created_at__gte=month_start).count(),
        "to_ship": Order.objects.filter(status__in=[Order.Status.PAID, Order.Status.PREPARING]).count(),
        "low_stock": Product.objects.filter(is_active=True, stock__lte=settings.LOW_STOCK_THRESHOLD).count(),
        "threshold": settings.LOW_STOCK_THRESHOLD,
    }

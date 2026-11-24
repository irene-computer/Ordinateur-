from django.contrib import admin
from django.core.mail import send_mail

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "name", "price_cents", "quantity"]
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["number", "created_at", "full_name", "email", "total_euros", "status"]
    list_filter = ["status", "created_at"]
    search_fields = ["full_name", "email", "id"]
    readonly_fields = ["public_id", "user", "subtotal_cents", "shipping_cents", "total_cents", "stripe_session_id", "created_at"]
    inlines = [OrderItemInline]
    actions = ["mark_preparing", "mark_shipped"]

    @admin.display(description="Total")
    def total_euros(self, obj):
        return f"{obj.total_cents / 100:.2f} €".replace(".", ",")

    @admin.action(description="Passer en préparation")
    def mark_preparing(self, request, queryset):
        n = queryset.filter(status=Order.Status.PAID).update(status=Order.Status.PREPARING)
        self.message_user(request, f"{n} commande(s) en préparation.")

    @admin.action(description="Marquer comme expédiée (envoie un e-mail au client)")
    def mark_shipped(self, request, queryset):
        orders = list(queryset.filter(status__in=[Order.Status.PAID, Order.Status.PREPARING]))
        for order in orders:
            order.status = Order.Status.SHIPPED
            order.save(update_fields=["status"])
            send_mail(
                f"Votre commande {order.number} est expédiée",
                f"Bonjour {order.full_name},\n\nVotre commande est en route."
                + (f"\nNuméro de suivi : {order.tracking_number}" if order.tracking_number else "")
                + "\n\nL'équipe Ordinateur+",
                None, [order.email], fail_silently=True,
            )
        self.message_user(request, f"{len(orders)} commande(s) expédiée(s).")

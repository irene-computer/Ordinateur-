import stripe
from django import forms
from django.conf import settings
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from cart.cart import Cart

from .models import Order
from .services import CheckoutError, Customer, create_order, mark_paid, start_payment


class CheckoutForm(forms.Form):
    full_name = forms.CharField(label="Nom complet", max_length=150)
    email = forms.EmailField(label="E-mail")
    address = forms.CharField(label="Adresse", max_length=255)
    postal_code = forms.RegexField(label="Code postal", regex=r"^\d{5}$", error_messages={"invalid": "5 chiffres attendus."})
    city = forms.CharField(label="Ville", max_length=100)
    accept_terms = forms.BooleanField(label="J'accepte les conditions générales de vente")


def checkout(request):
    cart = Cart(request)
    summary = cart.summary()
    if not summary["lines"]:
        return redirect("cart:detail")

    initial = {}
    if request.user.is_authenticated:
        initial = {"email": request.user.email, "full_name": request.user.get_full_name()}
    form = CheckoutForm(request.POST or None, initial=initial)

    if request.method == "POST" and form.is_valid():
        data = {k: v for k, v in form.cleaned_data.items() if k != "accept_terms"}
        try:
            order = create_order(Customer(**data), [(l["product"].pk, l["quantity"]) for l in summary["lines"]], request.user)
            url = start_payment(order)
        except CheckoutError as e:
            messages.error(request, str(e))
            return redirect("cart:detail")
        cart.clear()
        return redirect(url)

    return render(request, "orders/checkout.html", {**summary, "form": form})


def confirmation(request, public_id):
    order = get_object_or_404(Order.objects.prefetch_related("items"), public_id=public_id)
    return render(request, "orders/confirmation.html", {"order": order, "simulation": "simulation" in request.GET})


@csrf_exempt
@require_POST
def stripe_webhook(request):
    if not (settings.STRIPE_SECRET_KEY and settings.STRIPE_WEBHOOK_SECRET):
        return HttpResponse(status=400)
    try:
        event = stripe.Webhook.construct_event(
            request.body, request.headers.get("Stripe-Signature", ""), settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.SignatureVerificationError):
        return HttpResponse(status=400)
    if event["type"] == "checkout.session.completed":
        order_id = event["data"]["object"].get("metadata", {}).get("order_id")
        if order_id:
            mark_paid(int(order_id))
    return HttpResponse(status=200)

from django.urls import re_path
from rest_framework.authtoken.views import obtain_auth_token

from orders.views import stripe_webhook

from . import views

# Barre finale facultative : l'app mobile appelle /api/products et /api/checkout sans « / »
urlpatterns = [
    re_path(r"^products/?$", views.products),
    re_path(r"^products/(?P<slug>[-\w]+)/?$", views.product_detail),
    re_path(r"^categories/?$", views.categories),
    re_path(r"^checkout/?$", views.checkout),
    re_path(r"^orders/?$", views.my_orders),
    re_path(r"^auth/token/?$", obtain_auth_token),
    re_path(r"^stripe/webhook/?$", stripe_webhook),
]

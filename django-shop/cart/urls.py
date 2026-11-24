from django.urls import path

from . import views

app_name = "cart"
urlpatterns = [
    path("", views.cart_detail, name="detail"),
    path("ajouter/<int:product_id>/", views.cart_add, name="add"),
    path("modifier/<int:product_id>/", views.cart_update, name="update"),
]

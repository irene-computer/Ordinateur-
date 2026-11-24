from django.urls import path

from . import views

app_name = "catalog"
urlpatterns = [
    path("", views.home, name="home"),
    path("produits/", views.product_list, name="list"),
    path("produits/<slug:slug>/", views.product_detail, name="product"),
]

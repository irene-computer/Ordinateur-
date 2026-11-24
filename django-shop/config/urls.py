from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Ordinateur+ · Administration"
admin.site.site_title = "Ordinateur+"
admin.site.index_title = "Tableau de bord"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("panier/", include("cart.urls")),
    path("commande/", include("orders.urls")),
    path("compte/", include("accounts.urls")),
    path("", include("catalog.urls")),
]

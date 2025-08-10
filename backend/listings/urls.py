# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FoodItemListView,
    FoodItemDetailView,
    ReservationListCreateView,
    CartViewSet,            # 👈 add this
)

router = DefaultRouter()
router.register(r"cart", CartViewSet, basename="cart")

urlpatterns = [
    path("fooditems/", FoodItemListView.as_view(), name="fooditem-list"),
    path("fooditems/<uuid:item_id>/", FoodItemDetailView.as_view(), name="fooditem-detail"),
    path("reservations/", ReservationListCreateView.as_view(), name="reservation-list-create"),
    path("", include(router.urls)),     # 👈 exposes /cart/, /cart/{id}/, etc.
]

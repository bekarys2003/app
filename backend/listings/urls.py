from django.urls import path
from .views import FoodItemListView, FoodItemDetailView

urlpatterns = [
    path("fooditems/", FoodItemListView.as_view(), name="fooditem-list"),
    path("fooditems/<uuid:item_id>/", FoodItemDetailView.as_view(), name="fooditem-detail"),

]

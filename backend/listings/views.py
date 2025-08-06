from django.shortcuts import render

# Create your views here.
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import FoodItem
from .serializers import FoodItemSerializer

class FoodItemListView(ListAPIView):
    serializer_class = FoodItemSerializer

    def get_queryset(self):
        return FoodItem.objects.filter(available_quantity__gt=0).order_by("-created_at")



class FoodItemDetailView(RetrieveAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    lookup_field = "item_id"

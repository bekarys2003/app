from django.shortcuts import render

# Create your views here.
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import FoodItem, Reservation
from .serializers import FoodItemSerializer
from rest_framework import generics, permissions
from .serializers import ReservationSerializer
from rest_framework.permissions import AllowAny


class FoodItemListView(ListAPIView):
    queryset = FoodItem.objects.filter(available_quantity__gt=0).order_by("-created_at")
    serializer_class = FoodItemSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

class FoodItemDetailView(RetrieveAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    lookup_field = "item_id"
    authentication_classes = []
    permission_classes = [AllowAny]



class ReservationListCreateView(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).select_related('food_item')

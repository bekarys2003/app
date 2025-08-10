from django.shortcuts import render

# Create your views here.
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import FoodItem, Reservation, CartItem
from .serializers import FoodItemSerializer, CartItemSerializer
from rest_framework import generics, permissions
from .serializers import ReservationSerializer
from rest_framework.permissions import AllowAny

from rest_framework import mixins, viewsets
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework import status

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



class CartViewSet(viewsets.GenericViewSet,
                  mixins.ListModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (CartItem.objects
                .filter(user=self.request.user)
                .select_related("food_item"))
    # DELETE /cart/clear/
    @action(detail=False, methods=["delete"])
    def clear(self, request):
        deleted, _ = self.get_queryset().delete()
        return Response({"deleted": deleted}, status=status.HTTP_204_NO_CONTENT)
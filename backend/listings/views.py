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

# views.py
from django.db.models import Q

# views.py
import re
from django.db.models import F, FloatField, ExpressionWrapper, Value
from django.db.models.functions import ACos, Cos, Sin, Radians, Least, Greatest
from django.db.models import Q
import re

CATEGORY_MAP = {
    "grocery": "groceries",
    "groceries": "groceries",
    "fast food": "meals",
    "meals": "meals",
    "pastry": "pastries",
    "pastries": "pastries",
}

def _safe_float(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

class FoodItemListView(ListAPIView):
    serializer_class = FoodItemSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = (FoodItem.objects
              .filter(available_quantity__gt=0)
              .select_related("store"))

        # ----- category filter (supports ?category=a&category=b OR comma-separated) -----
        raw = self.request.query_params.getlist("category")
        if not raw:
            comma = self.request.query_params.get("category")
            if comma:
                raw = [p.strip() for p in comma.split(",") if p.strip()]
        if raw:
            normalized = []
            for r in raw:
                key = r.strip().lower()
                mapped = CATEGORY_MAP.get(key)
                if mapped:
                    normalized.append(mapped)
            if normalized:
                qs = qs.filter(category__in=normalized)

        # ----- text search (?q=...) -----
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            terms = [t for t in re.split(r"\s+", q) if t]
            for term in terms:
                qs = qs.filter(
                    Q(title__icontains=term)
                    | Q(description__icontains=term)
                    | Q(address__icontains=term)
                    | Q(store__name__icontains=term)
                )

        # ----- nearest-by-store (?lat=...&lng=...&max_distance_km=...) -----
        lat = _safe_float(self.request.query_params.get("lat"))
        lng = _safe_float(self.request.query_params.get("lng"))
        max_km = _safe_float(self.request.query_params.get("max_distance_km"))

        if lat is not None and lng is not None:
            acos_arg = Least(
                Value(1.0),
                Greatest(
                    Value(-1.0),
                    Cos(Radians(Value(lat))) * Cos(Radians(F("store__latitude"))) *
                    Cos(Radians(F("store__longitude") - Value(lng))) +
                    Sin(Radians(Value(lat))) * Sin(Radians(F("store__latitude")))
                ),
            )
            distance_expr = ExpressionWrapper(
                Value(6371.0) * ACos(acos_arg),
                output_field=FloatField()
            )
            qs = qs.annotate(distance_km=distance_expr)
            if max_km is not None:
                qs = qs.filter(distance_km__lte=max_km)
            qs = qs.order_by("distance_km", "-created_at")
        else:
            qs = qs.order_by("-created_at")

        return qs



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
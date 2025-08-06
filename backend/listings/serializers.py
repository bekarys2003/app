from rest_framework import serializers
from .models import FoodItem

class FoodItemSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = FoodItem
        fields = [
            "item_id",
            "title",
            "address",
            "pickup_start",
            "pickup_end",
            "image",
            "rating",
            "rating_count",
            "available_quantity",
            "price",
            "price_before",
            "store_name",
        ]

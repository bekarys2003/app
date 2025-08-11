from rest_framework import serializers
from .models import FoodItem, Reservation, CartItem

class FoodItemSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)
    image = serializers.ImageField(use_url=True)
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = FoodItem
        fields = [
            "id",  # 👈 Add this!
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
            "distance_km",
        ]

    def get_distance_km(self, obj):
        d = getattr(obj, "distance_km", None)
        return round(float(d), 2) if d is not None else None





class ReservationSerializer(serializers.ModelSerializer):
    food = FoodItemSerializer(source="food_item", read_only=True)   # ✅ add this
    food_item_title = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'food_item', 'food',            # ✅ include nested food
            'food_item_title', 'quantity', 'reserved_at', 'is_collected', 'user_email'
        ]
        read_only_fields = ['id', 'reserved_at', 'is_collected', 'food_item_title', 'food']

    def get_food_item_title(self, obj):
        return obj.food_item.title if obj.food_item else None

    def validate(self, attrs):
        food_item = attrs['food_item']
        quantity = attrs['quantity']
        if food_item.available_quantity < quantity:
            raise serializers.ValidationError("Not enough quantity available.")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        food_item = validated_data['food_item']
        quantity = validated_data['quantity']

        food_item.available_quantity -= quantity
        food_item.save()

        return Reservation.objects.create(user=user, **validated_data)

    def get_user_email(self, obj):
        return obj.user.email   # ✅ end the method here (no stray text)


class CartItemSerializer(serializers.ModelSerializer):
    food_item = FoodItemSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "food_item", "quantity", "added_at"]

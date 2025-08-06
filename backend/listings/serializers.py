from rest_framework import serializers
from .models import FoodItem, Reservation

class FoodItemSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)
    image = serializers.ImageField(use_url=True)

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
        ]



class ReservationSerializer(serializers.ModelSerializer):
    food_item_title = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'food_item', 'food_item_title', 'quantity', 'reserved_at', 'is_collected', 'user_email']
        read_only_fields = ['id', 'reserved_at', 'is_collected', 'food_item_title']

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
        return obj.user.email
# listings/admin.py
from django.contrib import admin
from .models import Store, FoodItem, CartItem, Reservation

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "is_verified", "created_at")
    search_fields = ("name", "city")

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ("title", "store", "available_quantity", "price", "created_at")
    list_filter  = ("store",)
    search_fields = ("title", "store__name", "item_id")  # <- needed for autocomplete

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("user", "food_item", "quantity", "added_at")
    list_filter = ("user", "food_item__store")
    search_fields = ("user__email", "food_item__title")  # <- you already had this
    autocomplete_fields = ("food_item",)  # <- drop "user" to avoid UserAdmin requirements
    date_hierarchy = "added_at"



@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("user", "food_item", "quantity", "reserved_at", "is_collected")
    list_filter = ("user", "is_collected", "food_item__store")
    search_fields = ("user__email", "food_item__title")
    autocomplete_fields = ("food_item",)
    date_hierarchy = "reserved_at"

    def mark_as_collected(self, request, queryset):
        updated = queryset.update(is_collected=True)
        self.message_user(request, f"Marked {updated} reservation(s) as collected.")
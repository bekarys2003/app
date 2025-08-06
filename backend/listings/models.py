from django.db import models
import uuid
from django.contrib.auth import get_user_model


User = get_user_model()

class FoodItem(models.Model):
    item_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=255)
    store = models.ForeignKey("Store", on_delete=models.CASCADE, related_name="food_items")
    image = models.ImageField(upload_to='food_items/')
    rating = models.FloatField(default=0.0)
    rating_count = models.PositiveIntegerField(default=0)
    address = models.CharField(max_length=255)

    pickup_date = models.DateField()
    pickup_start = models.TimeField()
    pickup_end = models.TimeField()

    description = models.TextField()
    available_quantity = models.PositiveIntegerField(default=0)

    price_before = models.DecimalField(max_digits=6, decimal_places=2)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def pickup_time_display(self):
        return f"{self.pickup_start.strftime('%H:%M')} - {self.pickup_end.strftime('%H:%M')}"



class Store(models.Model):
    store_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stores')

    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='store_logos/', null=True, blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

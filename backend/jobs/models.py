from django.db import models
from accaunts.models import User
# Create your models here.

class Jobs(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]


    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    date_applied = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='applied')
    link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} - {self.position}"
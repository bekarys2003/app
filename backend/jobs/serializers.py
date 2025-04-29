from rest_framework import serializers
from .models import Jobs

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jobs
        fields = ['id', 'company_name', 'position', 'date_applied', 'status', 'link', 'notes', 'created_at']  # no 'user'
        read_only_fields = ['id', 'created_at']
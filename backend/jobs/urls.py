from django.urls import path
from .views import JobAdd

urlpatterns = [
    path('jobs/add/', JobAdd.as_view(), name='job-add'),
]
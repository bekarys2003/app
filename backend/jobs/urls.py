from django.urls import path
from .views import JobAdd, JobList

urlpatterns = [
    path('jobs/add/', JobAdd.as_view(), name='job-add'),
    path('jobs/', JobList.as_view(), name='job-list'),

]
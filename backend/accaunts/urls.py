from django.urls import path, include
from .views import RegisterAPIView, LoginAPIView, UserAPIView, RefreshAPIView, LogoutAPIView, ForgotAPIView, ResetAPIView, GoogleAuthAPIView, apple_auth_view


urlpatterns = [
    path('register', RegisterAPIView.as_view()),
    path('login', LoginAPIView.as_view()),
    path('user', UserAPIView.as_view()),
    path('refresh', RefreshAPIView.as_view()),
    path('logout', LogoutAPIView.as_view()),
    path('forgot', ForgotAPIView.as_view()),
    path('reset', ResetAPIView.as_view()),
    path('google-auth', GoogleAuthAPIView.as_view()),
    path("apple-auth", apple_auth_view, name="apple-auth"),
]

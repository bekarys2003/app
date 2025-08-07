from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header
from rest_framework import exceptions
from .serializers import UserSerializer
from .models import User, UserToken, Reset
from .authentication import create_access_token, JWTAuthentication, create_refresh_token, decode_refresh_token
import datetime, random, string
from django.core.mail import send_mail
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport.requests import Request
from django.utils import timezone
from django.http import JsonResponse
import json
from rest_framework.permissions import AllowAny
import jwt
import requests
from decouple import config



class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data

        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Password do not match!')

        serializer = UserSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        UserToken.objects.create(
            user_id=user.id,
            token=refresh_token,
            expired_at=timezone.now() + datetime.timedelta(days=7)
        )

        return Response({
            'token': access_token,
            'refresh_token': refresh_token
        })


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data['email']
        password = request.data['password']

        user = User.objects.filter(email=email).first()

        if user is None or not user.check_password(password):
            raise exceptions.AuthenticationFailed('invalid credentials')

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        UserToken.objects.create(
            user_id=user.id,
            token=refresh_token,
            expired_at=timezone.now() + datetime.timedelta(days=7)
        )

        return Response({
            'token': access_token,
            'refresh_token': refresh_token
        })


class UserAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

from rest_framework.permissions import AllowAny

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')  # ✅ move here
class RefreshAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = (
            request.COOKIES.get('refresh_token') or
            request.data.get('refresh_token')
        )
        if not refresh_token:
            raise exceptions.AuthenticationFailed('unauthenticated')
        try:
            id = decode_refresh_token(refresh_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed('unauthenticated')
        token_valid = UserToken.objects.filter(
            user_id=id,
            token=refresh_token,
            expired_at__gt=datetime.datetime.now(datetime.timezone.utc)
        ).exists()
        if not token_valid:
            raise exceptions.AuthenticationFailed('unauthenticated')

        access_token = create_access_token(id)
        return Response({
            'token': access_token,
            'refresh_token': refresh_token
        })



class LogoutAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh_token')
        UserToken.objects.filter(token=refresh_token).delete()

        return Response({
            'message': 'success'
        })


class ForgotAPIView(APIView):
    def post(self, request):
        email = request.data['email']
        token = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))

        Reset.objects.create(email=email, token=token)

        url = f"http://localhost:8081/auth-tabs/reset/{token}"
        send_mail(
            subject='Reset your password',
            message=f'Click the following link to reset your password: {url}',
            from_email='from@example.com',
            recipient_list=[email],
            html_message=f'Click <a href="{url}">here</a> to reset your password'
        )

        return Response({'message': 'success'})


class ResetAPIView(APIView):
    def post(self, request):
        data = request.data

        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Password do not match!')

        reset_password = Reset.objects.filter(token=data['token']).first()

        if not reset_password:
            raise exceptions.APIException('Invalid link!')

        user = User.objects.filter(email=reset_password.email).first()

        if not user:
            raise exceptions.APIException('User not found!')

        user.set_password(data['password'])
        user.save()

        return Response({'message': 'success'})


class GoogleAuthAPIView(APIView):
    def post(self, request):
        token = request.data.get('token')

        if not token:
            raise exceptions.AuthenticationFailed('Token not provided')

        try:
            googleUser = id_token.verify_oauth2_token(
                token,
                Request(),
                "9816983038-gs6t478e6vo67af9p4askcdsf4qctomv.apps.googleusercontent.com"
            )
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid Google token')

        if not googleUser or 'email' not in googleUser:
            raise exceptions.AuthenticationFailed('Failed to retrieve user info from Google')

        email = googleUser['email']
        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create(email=email)
            user.set_password(token)
            user.save()

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        UserToken.objects.create(
            user_id=user.id,
            token=refresh_token,
            expired_at=timezone.now() + datetime.timedelta(days=7)
        )

        return Response({
            'token': access_token,
            'refresh_token': refresh_token
        })

from jose import jwt as jose_jwt

@csrf_exempt
def apple_auth_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
        identity_token = body.get("token")

        if not identity_token:
            return JsonResponse({"error": "Token not provided"}, status=400)

        headers = jose_jwt.get_unverified_header(identity_token)
        apple_keys = requests.get("https://appleid.apple.com/auth/keys").json()["keys"]

        key = next((k for k in apple_keys if k["kid"] == headers["kid"]), None)
        if not key:
            return JsonResponse({"error": "Invalid token: key not found"}, status=400)

        decoded = jose_jwt.decode(
            identity_token,
            key,
            algorithms=["RS256"],
            audience="host.exp.Exponent",
            issuer="https://appleid.apple.com",
        )

        email = decoded.get("email")
        if not email:
            return JsonResponse({"error": "Email not present in token"}, status=400)

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create(email=email)
            user.set_password(identity_token)
            user.save()

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        UserToken.objects.create(
            user_id=user.id,
            token=refresh_token,
            expired_at=timezone.now() + datetime.timedelta(days=7)
        )

        return JsonResponse({
            "token": access_token,
            "refresh_token": refresh_token
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

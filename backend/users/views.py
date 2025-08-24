# users/views.py
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
import jwt, time
from django.conf import settings

def make_jwt(payload: dict, exp_seconds=60*60*24*7):  # 7 days
    to_encode = payload | {"exp": int(time.time()) + exp_seconds}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = (request.data.get("username") or "").strip().lower()
        password = request.data.get("password") or ""
        confirm  = request.data.get("confirm") or ""

        if not username:
            return Response({"error": "Username required."}, status=400)

        if password != confirm:
            return Response({"error": "Passwords do not match."}, status=400)

        if len(password) < 8:
            return Response({"error": "Password must be at least 8 characters."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken."}, status=400)

        # create user
        user = User.objects.create(
            username=username,
            password=make_password(password),  # Django hashes it
        )

        return Response({"message": "Registered successfully. Please sign in."}, status=201)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = (request.data.get("username") or "").strip().lower()
        password = request.data.get("password") or ""

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Invalid username or password."}, status=401)

        access = make_jwt({"sub": user.id, "username": user.username})

        return Response({
            "access": access,
            "user": UserSerializer(user).data
        }, status=200)



from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "password", "confirm")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm"]:
            raise serializers.ValidationError({"confirm": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm")
        user = User.objects.create_user(
            username=validated_data["username"].lower(),
            password=validated_data["password"],
        )
        return user



# users/serializers.py
from rest_framework import serializers
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "avatar_url", "interests", "moods"]

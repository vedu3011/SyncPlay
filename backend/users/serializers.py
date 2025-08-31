

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from music.models import Artist, Genre
from music.serializers import ArtistSerializer, GenreSerializer
from .models import User

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
     preferred_artists = ArtistSerializer(many=True)
     preferred_genres = GenreSerializer(many=True)
     class Meta:
        model = User
        fields = ["id", "username", "avatar_url", "interests", "moods","preferred_artists", "preferred_genres"]



class PreferencesWriteSerializer(serializers.Serializer):
    artist_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )
    genre_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )

    def validate(self, data):
        # enforce limits
        if len(data["artist_ids"]) > 5:
            raise serializers.ValidationError("You can select up to 5 artists.")
        if len(data["genre_ids"]) > 10:
            raise serializers.ValidationError("You can select up to 10 genres.")
        return data

class PreferencesReadSerializer(serializers.ModelSerializer):
    preferred_artists = ArtistSerializer(many=True)
    preferred_genres = GenreSerializer(many=True)

    class Meta:
        model = User
        fields = ["preferred_artists", "preferred_genres"]
# backend/social/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FriendRequest, Friendship

User = get_user_model()

class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "avatar_url")

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserLiteSerializer()
    receiver = UserLiteSerializer()
    class Meta:
        model = FriendRequest
        fields = ("id", "sender", "receiver", "status", "created_at")

class FriendshipSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    is_archived = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ("id", "other_user", "last_message_at", "is_favorite", "is_archived")

    def get_other_user(self, obj):
        user = self.context["request"].user
        return UserLiteSerializer(obj.other_of(user)).data

    def get_is_favorite(self, obj):
        u = self.context["request"].user
        return obj.is_favorite_for_a if obj.user_a == u else obj.is_favorite_for_b

    def get_is_archived(self, obj):
        u = self.context["request"].user
        return obj.is_archived_for_a if obj.user_a == u else obj.is_archived_for_b

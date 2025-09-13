# backend/jam/serializers.py
from rest_framework import serializers
from .models import Playlist, PlaylistTrack

class PlaylistTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistTrack
        fields = ("id", "video_id", "title", "artist_name", "thumbnail_url", "duration_sec", "added_by_id", "added_at", "position")

class PlaylistSerializer(serializers.ModelSerializer):
    tracks = PlaylistTrackSerializer(many=True, read_only=True)
    class Meta:
        model = Playlist
        fields = ("id", "name", "owner_id", "friendship_id", "is_collaborative", "created_at", "tracks")




# backend/jam/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Room, RoomMembership, RoomQueueTrack, RoomSuggestion
from .models import Playlist, PlaylistTrack  # existing

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")

class RoomQueueTrackSerializer(serializers.ModelSerializer):
    added_by = UserMiniSerializer(read_only=True)
    class Meta:
        model = RoomQueueTrack
        fields = ("id", "yt_video_id", "title", "artist_name", "thumbnail_url",
                  "duration_sec", "position", "added_by", "added_at")

class RoomSuggestionSerializer(serializers.ModelSerializer):
    suggested_by = UserMiniSerializer(read_only=True)
    class Meta:
        model = RoomSuggestion
        fields = ("id", "yt_video_id", "title", "artist_name", "thumbnail_url",
                  "duration_sec", "suggested_by", "suggested_at")

class RoomSerializer(serializers.ModelSerializer):
    host = UserMiniSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    class Meta:
        model = Room
        fields = ("id", "name", "is_private", "join_code", "created_at", "host", "members_count")

    def get_members_count(self, obj):
        return obj.memberships.count()

class RoomDetailSerializer(serializers.ModelSerializer):
    host = UserMiniSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    queue = RoomQueueTrackSerializer(many=True, read_only=True)
    suggestions = RoomSuggestionSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ("id", "name", "is_private", "join_code", "created_at",
                  "host", "members", "queue", "suggestions")

    def get_members(self, obj):
        mems = obj.memberships.select_related("user").all()
        return [{"user": UserMiniSerializer(m.user).data, "role": m.role} for m in mems]

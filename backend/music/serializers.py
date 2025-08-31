# backend/music/serializers.py
from rest_framework import serializers
from .models import Artist, Genre, Playlist, PlaylistItem, UserHistory

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ["id", "name", "image_url", "popularity"]

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name", "slug"]


class TrackSerializer(serializers.Serializer):
    # We don't persist recommendation results; they’re transient
    title = serializers.CharField()
    artist_name = serializers.CharField()
    yt_video_id = serializers.CharField(allow_null=True, allow_blank=True)
    thumbnail_url = serializers.CharField(allow_null=True, allow_blank=True)
    duration_sec = serializers.IntegerField()


class PlaylistSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    cover_url = serializers.CharField(allow_null=True, allow_blank=True)
    source = serializers.CharField()
    track_count = serializers.IntegerField(required=False)
    songs = TrackSerializer(many=True, required=False) 

class HistoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHistory
        fields = ("item_type", "title", "subtitle", "image_url", "played_at","yt_video_id")

class HomeSummarySerializer(serializers.Serializer):
    welcome_text = serializers.CharField()
    is_new_user = serializers.BooleanField()
    continue_listening = HistoryItemSerializer(many=True)
    recommendations = TrackSerializer(many=True)
    playlists_for_you = PlaylistSerializer(many=True)
    top_creators = serializers.ListField(child=serializers.DictField())


class PlaylistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistItem
        fields = ("video_id", "title", "artist_name", "thumbnail_url", "duration_sec", "added_at")


class PlaylistListSerializer(serializers.ModelSerializer):
    track_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = Playlist
        fields = ("id", "name", "is_favourites", "is_custom", "track_count", "created_at")


class PlaylistDetailSerializer(serializers.ModelSerializer):
    tracks = PlaylistItemSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ("id", "name", "is_favourites", "is_custom", "created_at", "tracks")


class CreatePlaylistSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)

    def validate_name(self, value):
        user = self.context["request"].user
        if Playlist.objects.filter(user=user, name__iexact=value.strip()).exists():
            raise serializers.ValidationError("You already have a playlist with this name")
        return value.strip()


class TrackWriteSerializer(serializers.Serializer):
    video_id = serializers.CharField()
    title = serializers.CharField()
    artist_name = serializers.CharField(allow_blank=True, required=False, default="")
    thumbnail_url = serializers.CharField(allow_blank=True, required=False, default="")
    duration_sec = serializers.IntegerField(required=False, default=0)    
# music/views_playlists.py
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import api_view

from social.models import Friendship

from .models import Playlist, PlaylistItem
from .serializers import (
    PlaylistListSerializer, PlaylistDetailSerializer,
    CreatePlaylistSerializer, TrackWriteSerializer
)

def get_or_create_favourites(user):
    fav = Playlist.objects.filter(user=user, is_favourites=True).first()
    if not fav:
        fav = Playlist.objects.create(user=user, name="Favourites", is_favourites=True, is_custom=False)
    return fav


class MyPlaylistsView(APIView):
    """
    GET -> list user's playlists (favourites + custom)
    POST -> create a new custom playlist
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pls = Playlist.objects.filter(user=request.user).order_by("-is_favourites", "-id")
        data = PlaylistListSerializer(pls, many=True).data
        return Response(data)

    def post(self, request):
        ser = CreatePlaylistSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        pl = Playlist.objects.create(user=request.user, name=ser.validated_data["name"], is_custom=True)
        return Response(PlaylistDetailSerializer(pl).data, status=status.HTTP_201_CREATED)


class MyPlaylistDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, playlist_id: int):
        pl = get_object_or_404(Playlist, id=playlist_id, user=request.user)
        return Response(PlaylistDetailSerializer(pl).data)


class AddTrackToPlaylistView(APIView):
    """
    POST /api/music/my-playlists/<id>/add-track/
    Body: { video_id, title, artist_name, thumbnail_url, duration_sec }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, playlist_id: int):
        pl = get_object_or_404(Playlist, id=playlist_id, user=request.user)
        ser = TrackWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        data = ser.validated_data
        item, created = PlaylistItem.objects.get_or_create(
            playlist=pl,
            video_id=data["video_id"],
            defaults={
                "title": data["title"],
                "artist_name": data.get("artist_name", ""),
                "thumbnail_url": data.get("thumbnail_url", ""),
                "duration_sec": data.get("duration_sec", 0),
            },
        )
        if not created:
            return Response({"message": "This track is already in this playlist."}, status=200)

        return Response({"message": "Added to playlist."}, status=201)


class RemoveTrackFromPlaylistView(APIView):
    """
    DELETE /api/music/my-playlists/<id>/tracks/<video_id>/
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, playlist_id: int, video_id: str):
        pl = get_object_or_404(Playlist, id=playlist_id, user=request.user)
        deleted, _ = PlaylistItem.objects.filter(playlist=pl, video_id=video_id).delete()
        if deleted:
            return Response({"message": "Removed from playlist"}, status=200)
        return Response({"message": "Track not found in playlist"}, status=404)


class ToggleFavouriteView(APIView):
    """
    POST /api/music/favourites/toggle/
    Body: { video_id, title, artist_name, thumbnail_url, duration_sec }
    If track is already in favourites -> remove; else -> add
    Returns: { favourited: bool }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = TrackWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        fav = get_or_create_favourites(request.user)
        existing = PlaylistItem.objects.filter(playlist=fav, video_id=data["video_id"]).first()

        if existing:
            existing.delete()
            return Response({"favourited": False}, status=200)
        playlist_item, created = PlaylistItem.objects.get_or_create(
        playlist=fav,
        video_id=data.get("video_id"),
        defaults={
           'title': data.get("title"),
           'artist_name': data.get("artist_name"),
           'thumbnail_url': data.get("thumbnail_url"),
           'duration_sec': data.get("duration_sec", 0),
        }
       )

        if created:
         return Response({"message": "Added to favorites"}, status=201)
        else:
         return Response({"message": "Already in favorites"}, status=200)



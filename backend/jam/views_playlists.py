# backend/jam/views_playlists.py
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from jam import models
from .models import Playlist, PlaylistTrack
from .serializers import PlaylistSerializer, PlaylistTrackSerializer
from social.models import Friendship
from django.db.models import Max


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_shared_playlist(request, friendship_id):
    try:
        friendship = Friendship.objects.get(id=friendship_id)
    except Friendship.DoesNotExist:
        return Response({"error": "Friendship not found"}, status=status.HTTP_404_NOT_FOUND)

    name = request.data.get("name", "Shared Playlist")

    playlist = Playlist.objects.create(
        name=name,
        is_collaborative=True,
        friendship=friendship,
        # created_by=request.user
    )
    playlist.users.add(friendship.user_a, friendship.user_b)


    return Response(PlaylistSerializer(playlist).data, status=status.HTTP_201_CREATED)

class ListFriendshipPlaylists(APIView):
    permission_classes = [permissions.IsAuthenticated]
    # def get(self, request, fid):
    def get(self, request, friendship_id):
        # f = get_object_or_404(Friendship, id=fid)
        f = get_object_or_404(Friendship, id=friendship_id)
        if request.user not in (f.user_a, f.user_b):
            return Response({"error":"forbidden"}, status=403)
        qs = Playlist.objects.filter(friendship=f).order_by("-created_at")
        ser = PlaylistSerializer(qs, many=True)
        return Response(ser.data, status=200)

class AddTrackToPlaylist(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pid):
        playlist = get_object_or_404(Playlist, id=pid)
        # membership: either owner (personal) or friendship member for collaborative
        if playlist.is_collaborative:
            f = playlist.friendship
            if request.user not in (f.user_a, f.user_b):
                return Response({"error":"forbidden"}, status=403)
        else:
            if playlist.owner != request.user:
                return Response({"error":"forbidden"}, status=403)
        data = request.data
        with transaction.atomic():
            # last_pos = playlist.tracks.aggregate(models.Max('position'))['position__max'] or 0
            last_pos = playlist.tracks.aggregate(Max('position'))['position__max'] or 0

            tr, created = PlaylistTrack.objects.get_or_create(
                playlist=playlist,
                video_id=data.get("video_id"),
                defaults={
                    "title": data.get("title",""),
                    "artist_name": data.get("artist_name",""),
                    "thumbnail_url": data.get("thumbnail_url",""),
                    "duration_sec": data.get("duration_sec", 0),
                    "added_by": request.user,
                    "position": last_pos + 1
                }
            )
        return Response(PlaylistTrackSerializer(tr).data, status=201)

class RemoveTrackFromPlaylist(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pid, video_id):
        playlist = get_object_or_404(Playlist, id=pid)
        if playlist.is_collaborative:
            f = playlist.friendship
            if request.user not in (f.user_a, f.user_b):
                return Response({"error":"forbidden"}, status=403)
        else:
            if playlist.owner != request.user:
                return Response({"error":"forbidden"}, status=403)
        PlaylistTrack.objects.filter(playlist=playlist, video_id=video_id).delete()
        return Response({"message":"deleted"}, status=200)

class SavePlaylistAsPersonal(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pid):
        playlist = get_object_or_404(Playlist, id=pid)
        # ensure membership for collaborative ones
        if playlist.is_collaborative:
            f = playlist.friendship
            if request.user not in (f.user_a, f.user_b):
                return Response({"error":"forbidden"}, status=403)
        # duplicate playlist and tracks with owner=request.user
        new = Playlist.objects.create(name=playlist.name, owner=request.user, is_collaborative=False)
        tracks = playlist.tracks.all()
        for idx, t in enumerate(tracks, start=1):
            PlaylistTrack.objects.create(
                playlist=new,
                video_id=t.video_id,
                title=t.title,
                artist_name=t.artist_name,
                thumbnail_url=t.thumbnail_url,
                duration_sec=t.duration_sec,
                position=idx,
                added_by=request.user
            )
        return Response(PlaylistSerializer(new).data, status=201)


class PlaylistDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pid):
        playlist = get_object_or_404(Playlist, id=pid)
        
        # Check permissions
        if playlist.is_collaborative:
            # Collaborative playlist - check friendship membership
            if playlist.friendship:
                f = playlist.friendship
                if request.user not in (f.user_a, f.user_b):
                    return Response({"error": "forbidden"}, status=403)
        else:
            # Personal playlist - check ownership
            if playlist.owner != request.user:
                return Response({"error": "forbidden"}, status=403)
        
        return Response(PlaylistSerializer(playlist).data, status=200)
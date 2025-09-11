# backend/jam/views_rooms.py
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from jam import models
from .models import Room, RoomMembership, RoomQueueTrack, RoomSuggestion, Playlist, PlaylistTrack
from .serializers import (
    RoomSerializer, RoomDetailSerializer,
    RoomQueueTrackSerializer, RoomSuggestionSerializer
)
from .permissions_room import require_member, require_editor_or_host, require_host

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_room(request):
    name = request.data.get("name", "").strip() or "My Room"
    is_private = bool(request.data.get("is_private", False))
    room = Room.objects.create(name=name, host=request.user, is_private=is_private)
    RoomMembership.objects.create(room=room, user=request.user, role="host")
    return Response(RoomSerializer(room).data, status=201)

class MyRooms(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # rooms the user is a member of — split into public/private
        memberships = RoomMembership.objects.filter(user=request.user).select_related("room")
        public_rooms = [m.room for m in memberships if not m.room.is_private]
        private_rooms = [m.room for m in memberships if m.room.is_private]
        return Response({
            "public": RoomSerializer(public_rooms, many=True).data,
            "private": RoomSerializer(private_rooms, many=True).data,
        }, status=200)

class PublicRoomsSearch(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        qs = Room.objects.filter(is_private=False)
        if q:
            qs = qs.filter(name__icontains=q)
        data = RoomSerializer(qs.order_by("-created_at")[:50], many=True).data
        return Response(data, status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_by_code(request):
    code = (request.data.get("code") or "").strip().upper()
    if not code:
        return Response({"error": "code required"}, status=400)
    try:
        room = Room.objects.get(join_code=code)
    except Room.DoesNotExist:
        return Response({"error": "Invalid code"}, status=404)
    RoomMembership.objects.get_or_create(room=room, user=request.user, defaults={"role": "member"})
    return Response(RoomSerializer(room).data, status=200)

class RoomDetail(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        # public rooms are readable by anyone; private require membership
        if room.is_private and not require_member(room, request.user):
            return Response({"error": "forbidden"}, status=403)
        return Response(RoomDetailSerializer(room).data, status=200)

class AddSuggestion(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        if not require_member(room, request.user):
            return Response({"error": "forbidden"}, status=403)
        data = request.data
        s = RoomSuggestion.objects.create(
            room=room,
            yt_video_id=data.get("yt_video_id"),
            title=data.get("title", ""),
            artist_name=data.get("artist_name", ""),
            thumbnail_url=data.get("thumbnail_url", ""),
            duration_sec=data.get("duration_sec", 0),
            suggested_by=request.user,
        )
        return Response(RoomSuggestionSerializer(s).data, status=201)

class ApproveSuggestion(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, room_id, sid):
        room = get_object_or_404(Room, id=room_id)
        if not require_editor_or_host(room, request.user):
            return Response({"error": "forbidden"}, status=403)
        s = get_object_or_404(RoomSuggestion, id=sid, room=room)
        with transaction.atomic():
            last_pos = room.queue.aggregate(models.Max("position"))["position__max"] or 0
            q = RoomQueueTrack.objects.create(
                room=room,
                yt_video_id=s.yt_video_id,
                title=s.title,
                artist_name=s.artist_name,
                thumbnail_url=s.thumbnail_url,
                duration_sec=s.duration_sec,
                position=last_pos + 1,
                added_by=request.user
            )
            s.delete()
        return Response(RoomQueueTrackSerializer(q).data, status=201)

class QueueOps(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):  # add to queue (host/editor)
        room = get_object_or_404(Room, id=room_id)
        if not require_editor_or_host(room, request.user):
            return Response({"error": "forbidden"}, status=403)
        d = request.data
        last_pos = room.queue.aggregate(models.Max("position"))["position__max"] or 0
        q = RoomQueueTrack.objects.create(
            room=room,
            yt_video_id=d.get("yt_video_id"),
            title=d.get("title",""),
            artist_name=d.get("artist_name",""),
            thumbnail_url=d.get("thumbnail_url",""),
            duration_sec=d.get("duration_sec",0),
            position=last_pos + 1,
            added_by=request.user
        )
        return Response(RoomQueueTrackSerializer(q).data, status=201)

    def delete(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        if not require_editor_or_host(room, request.user):
            return Response({"error":"forbidden"}, status=403)
        vid = request.query_params.get("yt_video_id")
        RoomQueueTrack.objects.filter(room=room, yt_video_id=vid).delete()
        return Response({"ok": True}, status=200)

class SaveRoomQueueAsPersonal(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        # must be member to save
        if not require_member(room, request.user):
            return Response({"error": "forbidden"}, status=403)
        name = f"{room.name} - Room Queue"
        new = Playlist.objects.create(name=name, owner=request.user, is_collaborative=False)
        for idx, t in enumerate(room.queue.all(), start=1):
            PlaylistTrack.objects.create(
                playlist=new,
                video_id=t.yt_video_id,
                title=t.title,
                artist_name=t.artist_name,
                thumbnail_url=t.thumbnail_url,
                duration_sec=t.duration_sec,
                position=idx,
                added_by=request.user
            )
        return Response({"playlist_id": new.id, "name": new.name}, status=201)



class PromoteToEditor(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id, user_id):
        room = get_object_or_404(Room, id=room_id)
        # Only host can promote
        if not require_host(room, request.user):
            return Response({"error": "forbidden"}, status=403)

        mem = get_object_or_404(RoomMembership, room=room, user_id=user_id)
        if mem.role == "host":
            return Response({"error": "Cannot change host role"}, status=400)

        mem.role = "editor"
        mem.save()
        return Response({"message": "Promoted to editor"}, status=200)


class KickMember(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id, user_id):
        room = get_object_or_404(Room, id=room_id)
        # Only host can kick
        if not require_host(room, request.user):
            return Response({"error": "forbidden"}, status=403)

        mem = get_object_or_404(RoomMembership, room=room, user_id=user_id)
        if mem.role == "host":
            return Response({"error": "Cannot kick the host"}, status=400)

        mem.delete()
        return Response({"message": "Member removed"}, status=200)
    
class TransferHost(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id, user_id):
        room = get_object_or_404(Room, id=room_id)
        # Only current host can transfer
        if not require_host(room, request.user):
            return Response({"error": "forbidden"}, status=403)

        new_host_mem = get_object_or_404(RoomMembership, room=room, user_id=user_id)

        if new_host_mem.user == request.user:
            return Response({"error": "You are already the host"}, status=400)

        with transaction.atomic():
            # downgrade old host
            old_host_mem = RoomMembership.objects.get(room=room, user=request.user)
            old_host_mem.role = "editor"  # or "member", your choice
            old_host_mem.save()

            # upgrade new host
            new_host_mem.role = "host"
            new_host_mem.save()

            # update room reference
            room.host = new_host_mem.user
            room.save()

        return Response({"message": f"Host transferred to {new_host_mem.user.username}"}, status=200)

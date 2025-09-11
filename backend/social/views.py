# backend/social/views.py
from rest_framework import permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.crypto import get_random_string
from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


import base64

from .models import FriendRequest, Friendship
from .serializers import UserLiteSerializer, FriendRequestSerializer, FriendshipSerializer


def push_notify(user_id, payload):
    """
    Send a realtime notification to a user's NotificationConsumer group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{user_id}",
        {"type": "notify", **payload},
    )


User = get_user_model()

def generate_secret_b64():
    # 32 bytes for AES-GCM (256-bit)
    raw = get_random_string(32).encode("utf-8")
    return base64.b64encode(raw).decode()

class SearchUsersView(generics.ListAPIView):
    serializer_class = UserLiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    

    def get_queryset(self):
        q = (self.request.query_params.get("q") or "").strip().lower()
        me = self.request.user
        qs = User.objects.filter(username__icontains=q).exclude(id=me.id)
        # (Optionally exclude already friends or pending)
        return qs[:10]

class SendFriendRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        rid = request.data.get("receiver_id")
        if not rid: return Response({"error":"receiver_id required"}, status=400)
        if int(rid) == request.user.id: return Response({"error":"cannot add yourself"}, status=400)
        receiver = User.objects.filter(id=rid).first()
        if not receiver: return Response({"error":"user not found"}, status=404)

        # if already friends:
        if Friendship.for_users(request.user, receiver):
            return Response({"message":"Already friends"}, status=200)

        fr, created = FriendRequest.objects.get_or_create(
            sender=request.user, receiver=receiver, defaults={"status":FriendRequest.PENDING}
        )
        if not created and fr.status == FriendRequest.PENDING:
            return Response({"message":"Already requested"}, status=200)

        push_notify(receiver.id, {
           "type": "friend_request",
           "request": FriendRequestSerializer(fr).data
        })
        return Response(FriendRequestSerializer(fr).data, status=201)

class ListRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(receiver=self.request.user, status=FriendRequest.PENDING).order_by("-created_at")

class RespondRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        action = request.data.get("action")  # accept | reject | ignore
        fr = FriendRequest.objects.filter(id=pk, receiver=request.user).first()
        if not fr: return Response({"error":"Not found"}, status=404)
        if fr.status != FriendRequest.PENDING:
            return Response({"message":"Already handled"}, status=200)

        if action == "accept":
            with transaction.atomic():
                fr.status = FriendRequest.ACCEPTED; fr.save()
                a, b = Friendship.normalized_pair(fr.sender, fr.receiver)
                f, _ = Friendship.objects.get_or_create(
                    user_a=a, user_b=b,
                    defaults={"secret_b64": generate_secret_b64()}
                )
                # Notify sender → your request was accepted
            push_notify(fr.sender.id, {
                  "type": "friend_request_response",
                  "status": "accepted",
                  "friend": FriendshipSerializer(f, context={"request": request}).data,
                  "request_id": fr.id
                 })
            return Response({"message":"accepted"}, status=200)
        elif action == "reject":
            fr.status = FriendRequest.REJECTED; fr.save()
            push_notify(fr.sender.id, {
              "type": "friend_request_response",
              "status": "rejected",
              "request_id": fr.id
            })
            return Response({"message":"rejected"}, status=200)
        elif action == "ignore":
            fr.status = FriendRequest.IGNORED; fr.save()
            push_notify(fr.sender.id, {
            "type": "friend_request_response",
            "status": "ignored",
            "request_id": fr.id
           })
            return Response({"message":"ignored"}, status=200)
        else:
            return Response({"error":"invalid action"}, status=400)

class ListFriendsView(generics.ListAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        tab = (self.request.query_params.get("tab") or "all").lower()
        qs = Friendship.objects.filter(models.Q(user_a=u) | models.Q(user_b=u)).order_by("-last_message_at", "id")
        if tab == "favorites":
            qs = qs.filter(models.Q(user_a=u, is_favorite_for_a=True) | models.Q(user_b=u, is_favorite_for_b=True))
        if tab == "archived":
            qs = qs.filter(models.Q(user_a=u, is_archived_for_a=True) | models.Q(user_b=u, is_archived_for_b=True))
        return qs

class ToggleFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        f = Friendship.objects.filter(id=pk).first()
        if not f: return Response(status=404)
        if request.user == f.user_a:
            f.is_favorite_for_a = not f.is_favorite_for_a
        elif request.user == f.user_b:
            f.is_favorite_for_b = not f.is_favorite_for_b
        else:
            return Response(status=403)
        f.save()
        return Response({"favorite": True}, status=200)

class GetFriendshipSecretView(APIView):
    """Return base64 secret so the client can encrypt/decrypt."""
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        f = Friendship.objects.filter(id=pk).first()
        if not f: return Response(status=404)
        if request.user not in (f.user_a, f.user_b): return Response(status=403)
        return Response({"secret_b64": f.secret_b64})


class DebugTokenView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({
            "user_id": request.user.id,
            "username": request.user.username,
            "is_authenticated": request.user.is_authenticated,
        })
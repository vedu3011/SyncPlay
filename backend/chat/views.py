# backend/chat/views.py
from rest_framework import permissions, generics
from rest_framework.response import Response
from django.db.models import Q
from social.models import Friendship
from .models import Message
from .serializers import MessageSerializer

class HistoryView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        fid = self.kwargs["fid"]
        f = Friendship.objects.filter(id=fid).first()
        if not f or self.request.user not in (f.user_a, f.user_b):
            return Message.objects.none()
        return Message.objects.filter(friendship=f).order_by("created_at")[:200]



# backend/chat/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from social.models import Friendship

User = settings.AUTH_USER_MODEL

def default_expiry():
    return timezone.now() + timezone.timedelta(hours=6)  # ephemeral

class Message(models.Model):
    friendship = models.ForeignKey(Friendship, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    ciphertext = models.TextField()  # client-side encrypted
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(default=default_expiry)

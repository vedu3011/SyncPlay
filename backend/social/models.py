# backend/social/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models import Q

User = settings.AUTH_USER_MODEL

class FriendRequest(models.Model):
    PENDING = "P"
    ACCEPTED = "A"
    REJECTED = "R"
    IGNORED = "I"
    STATUS = [(PENDING, "Pending"), (ACCEPTED, "Accepted"), (REJECTED, "Rejected"), (IGNORED, "Ignored")]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_requests")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_requests")
    status = models.CharField(max_length=1, choices=STATUS, default=PENDING)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("sender", "receiver")

class Friendship(models.Model):
    """
    One row represents a pair (user_a < user_b lexicographically enforced via constraint).
    A per-friendship secret (base64) is stored for client-side encryption.
    """
    user_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_a")
    user_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_b")
    created_at = models.DateTimeField(default=timezone.now)
    is_favorite_for_a = models.BooleanField(default=False)
    is_favorite_for_b = models.BooleanField(default=False)
    is_archived_for_a = models.BooleanField(default=False)
    is_archived_for_b = models.BooleanField(default=False)
    last_message_at = models.DateTimeField(null=True, blank=True)
    secret_b64 = models.CharField(max_length=128)  # AES-GCM raw key base64

    class Meta:
        constraints = [
            models.CheckConstraint(check=~models.Q(user_a=models.F("user_b")), name="no_self_friend"),
            models.UniqueConstraint(fields=["user_a", "user_b"], name="unique_friend_pair"),
        ]

    @staticmethod
    def normalized_pair(u1, u2):
        return (u1, u2) if u1.id < u2.id else (u2, u1)

    @staticmethod
    def for_users(u1, u2):
        a, b = Friendship.normalized_pair(u1, u2)
        return Friendship.objects.filter(user_a=a, user_b=b).first()

    def other_of(self, user):
        return self.user_b if user == self.user_a else self.user_a

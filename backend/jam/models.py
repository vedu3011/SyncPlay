# backend/jam/models.py
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.db.models import JSONField

User = settings.AUTH_USER_MODEL

class JamSession(models.Model):
    # one jam session per Friendship (friendship FK)
    friendship = models.OneToOneField('social.Friendship', on_delete=models.CASCADE, related_name="jam_session")
    host = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)

    current_track_id = models.CharField(max_length=128, null=True, blank=True)
    current_track_title = models.CharField(max_length=512, null=True, blank=True)
    current_track_artist = models.CharField(max_length=512, null=True, blank=True)
    current_position = models.FloatField(default=0.0)
    is_playing = models.BooleanField(default=False)
    queue_position = models.IntegerField(default=0)
    last_sync_timestamp = models.BigIntegerField(null=True, blank=True)
    last_activity = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"JamSession {self.id} for friendship {self.friendship_id}"

class JamQueueItem(models.Model):
    jam_session = models.ForeignKey(JamSession, on_delete=models.CASCADE, related_name="queue")
    video_id = models.CharField(max_length=128)
    title = models.CharField(max_length=512)
    artist_name = models.CharField(max_length=512, blank=True)
    thumbnail_url = models.CharField(max_length=1024, blank=True)
    duration_sec = models.IntegerField(default=0)
    position = models.IntegerField(default=0)
    added_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    added_at = models.DateTimeField(default=timezone.now)
    played_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("jam_session", "video_id")
        ordering = ("position",)


from django.db import models
from django.conf import settings
from django.utils import timezone


class Playlist(models.Model):
    # nullable friendship: if set -> collaborative playlist for friendship
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="jam_playlists")  # personal owner if not collaborative
    friendship = models.ForeignKey("social.Friendship", null=True, blank=True, on_delete=models.CASCADE, related_name="shared_playlists")
    is_collaborative = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    users = models.ManyToManyField(User, related_name="joined_jam_playlists", blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

class PlaylistTrack(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="tracks")
    video_id = models.CharField(max_length=128)
    title = models.CharField(max_length=512)
    artist_name = models.CharField(max_length=512, blank=True)
    thumbnail_url = models.CharField(max_length=1024, blank=True)
    duration_sec = models.IntegerField(default=0)
    added_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    added_at = models.DateTimeField(default=timezone.now)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ["position"]
        unique_together = ("playlist", "video_id")






# backend/jam/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()

def generate_code(n=6):
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(n))

class Room(models.Model):
    name = models.CharField(max_length=255)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hosted_rooms")
    is_private = models.BooleanField(default=False)
    join_code = models.CharField(max_length=10, unique=True, default=generate_code)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({'Private' if self.is_private else 'Public'})"

class RoomMembership(models.Model):
    ROLE_CHOICES = (
        ('host', 'Host'),
        ('editor', 'Editor'),  # can control playback & approve suggestions
        ('member', 'Member'),  # can suggest songs
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="room_memberships")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('room', 'user')

class RoomQueueTrack(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="queue")
    yt_video_id = models.CharField(max_length=128)  # REQUIRED for YouTube playback
    title = models.CharField(max_length=512)
    artist_name = models.CharField(max_length=512, blank=True)
    thumbnail_url = models.CharField(max_length=1024, blank=True)
    duration_sec = models.IntegerField(default=0)
    position = models.IntegerField(default=0)
    added_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["position"]

class RoomSuggestion(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="suggestions")
    yt_video_id = models.CharField(max_length=128)
    title = models.CharField(max_length=512)
    artist_name = models.CharField(max_length=512, blank=True)
    thumbnail_url = models.CharField(max_length=1024, blank=True)
    duration_sec = models.IntegerField(default=0)
    suggested_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    suggested_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-suggested_at"]

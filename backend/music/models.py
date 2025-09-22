# backend/music/models.py
from time import timezone
from django.db import models
from django.utils.text import slugify
from social.models import Friendship
from django.conf import settings  # ✅ Correct Django way
from django.utils import timezone

User = settings.AUTH_USER_MODEL
class Artist(models.Model):
    name = models.CharField(max_length=255, unique=True)
    image_url = models.URLField(blank=True, null=True)
    popularity = models.IntegerField(default=0)  # optional, for sorting
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-popularity", "name"]

    def __str__(self):
        return self.name


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    yt_params = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name



class Track(models.Model):
    title = models.CharField(max_length=250)
    artist_name = models.CharField(max_length=200)              # denormalized for display
    yt_video_id = models.CharField(max_length=50, blank=True, null=True,unique=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    duration_sec = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.artist_name}"

class Playlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,null=True, related_name="playlists")
    title = models.CharField(max_length=200)
    name = models.CharField(max_length=120, default="My Playlist")
    cover_url = models.URLField(blank=True, null=True)
    source = models.CharField(max_length=40, default="generated")  # yt/generated
    yt_playlist_id = models.CharField(max_length=100, blank=True, null=True)  # YT Music playlist ID
    track_count = models.IntegerField(default=0)
    is_favourites = models.BooleanField(default=False)   # special auto-managed playlist
    is_custom = models.BooleanField(default=True)        # custom created by user
    is_collaborative = models.BooleanField(default=False)
   
    def __str__(self):
        return self.title
    class Meta:
        unique_together = [("user", "name")]

    def __str__(self):
        return f"{self.name} ({'favourites' if self.is_favourites else 'custom'})"



class PlaylistItem(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="items")
    video_id = models.CharField(max_length=32)      # YT video id
    title = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255, blank=True, default="")
    thumbnail_url = models.URLField(blank=True, default="")
    duration_sec = models.IntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)
   

    class Meta:
        unique_together = [("playlist", "video_id")]  # Avoid duplicates inside the same playlist

    def __str__(self):
        return f"{self.title} [{self.video_id}]"


class UserHistory(models.Model):
    TYPE_CHOICES = (("track", "track"), ("playlist", "playlist"))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="history")
    item_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    title = models.CharField(max_length=250)
    subtitle = models.CharField(max_length=250, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    played_at = models.DateTimeField(auto_now_add=True)
    yt_video_id = models.CharField(max_length=50, blank=True,default="") 

    class Meta:
        ordering = ["-played_at"]
        # unique_together = ("user" )

    def __str__(self):
        return f"{self.user.username} - {self.title}"    
    
    
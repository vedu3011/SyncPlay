# from django.db import models
# from django.conf import settings
# from django.utils import timezone

# User = settings.AUTH_USER_MODEL

# class Playlist(models.Model):
#     # nullable friendship: if set -> collaborative playlist for friendship
#     name = models.CharField(max_length=255)
#     owner = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="playlists")  # personal owner if not collaborative
#     friendship = models.ForeignKey("social.Friendship", null=True, blank=True, on_delete=models.CASCADE, related_name="shared_playlists")
#     is_collaborative = models.BooleanField(default=False)
#     created_at = models.DateTimeField(default=timezone.now)

#     class Meta:
#         ordering = ["-created_at"]

#     def __str__(self):
#         return self.name

# class PlaylistTrack(models.Model):
#     playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="tracks")
#     video_id = models.CharField(max_length=128)
#     title = models.CharField(max_length=512)
#     artist_name = models.CharField(max_length=512, blank=True)
#     thumbnail_url = models.CharField(max_length=1024, blank=True)
#     duration_sec = models.IntegerField(default=0)
#     added_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
#     added_at = models.DateTimeField(default=timezone.now)
#     position = models.IntegerField(default=0)

#     class Meta:
#         ordering = ["position"]
#         unique_together = ("playlist", "video_id")
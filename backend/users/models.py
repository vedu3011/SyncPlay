from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models
from music.models import Artist, Genre



class User(AbstractUser):
    avatar_url = models.URLField(blank=True, null=True)
    moods = models.JSONField(default=list, blank=True)       # e.g. ["chill","party"]
    interests = models.JSONField(default=list, blank=True)   # e.g. ["arijit singh", "pop"]


    preferred_artists = models.ManyToManyField(
        Artist, blank=True, related_name="fans"
    )
    preferred_genres = models.ManyToManyField(
        Genre, blank=True, related_name="followers"
    )

    def __str__(self):
        return self.username

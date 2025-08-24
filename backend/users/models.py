

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar_url = models.URLField(blank=True, null=True)
    moods = models.JSONField(default=list, blank=True)       # e.g. ["chill","party"]
    interests = models.JSONField(default=list, blank=True)   # e.g. ["arijit singh", "pop"]

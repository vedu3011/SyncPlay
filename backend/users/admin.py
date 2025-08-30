
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Profile", {
            "fields": (
                "avatar_url",
                "moods",
                "interests",
                "display_preferred_artists",   # readonly display method
                "display_preferred_genres",    # readonly display method
            )
        }),
    )

    readonly_fields = ("display_preferred_artists", "display_preferred_genres")

    def display_preferred_artists(self, obj):
        return ", ".join(artist.name for artist in obj.preferred_artists.all())
    display_preferred_artists.short_description = "Preferred Artists"

    def display_preferred_genres(self, obj):
        return ", ".join(genre.name for genre in obj.preferred_genres.all())
    display_preferred_genres.short_description = "Preferred Genres"

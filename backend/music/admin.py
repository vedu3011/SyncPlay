from django.contrib import admin
from .models import Artist, Genre ,UserHistory

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "popularity")
    search_fields = ("name",)

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name", "slug")



@admin.register(UserHistory)
class UserHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'yt_video_id', 'played_at', 'item_type')
    search_fields = ('title', 'artist_name', 'yt_video_id')
    list_filter = ('item_type', 'played_at')
    ordering = ('-played_at',)
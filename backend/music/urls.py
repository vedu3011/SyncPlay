# backend/music/urls.py
from django.urls import path
from .views_playlists import (
    MyPlaylistsView, MyPlaylistDetailView,
    AddTrackToPlaylistView, RemoveTrackFromPlaylistView, ToggleFavouriteView
)


from .views import ArtistDetailView, ArtistListView, CombinedSearchView, GenreListView, HomeSummaryView,  PlaylistDetailView,  RecordPlayedView, SavePreferencesView

urlpatterns = [
    path("artists/", ArtistListView.as_view(), name="artist-list"),
    path("genres/", GenreListView.as_view(), name="genre-list"),
    path("users/me/preferences/", SavePreferencesView.as_view()),
    path("home/summary/", HomeSummaryView.as_view()),
    path("music/played/", RecordPlayedView.as_view()),
    path("playlist/<str:playlist_id>/", PlaylistDetailView.as_view(), name="playlist-detail"),
    path("artist/<str:browse_id>/", ArtistDetailView.as_view()),
    path("search/", CombinedSearchView.as_view(), name="combined-search"),
     path("my-playlists/", MyPlaylistsView.as_view()),
    path("my-playlists/<int:playlist_id>/", MyPlaylistDetailView.as_view()),
    path("my-playlists/<int:playlist_id>/add-track/", AddTrackToPlaylistView.as_view()),
    path("my-playlists/<int:playlist_id>/tracks/<str:video_id>/", RemoveTrackFromPlaylistView.as_view()),
    path("favourites/toggle/", ToggleFavouriteView.as_view()),
   
]
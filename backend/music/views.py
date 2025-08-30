# backend/music/views.py
from django.utils import timezone
from rest_framework import generics, permissions
from .models import Artist, Genre
from .serializers import ArtistSerializer, GenreSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from urllib.parse import unquote
from .models import Artist, Genre, Playlist, UserHistory
from .serializers import (
    HomeSummarySerializer, HistoryItemSerializer, PlaylistSerializer
)
from .services.ytmusic_client import (
    fetch_artist_detail, fetch_playlist_detail, fetch_top_artists, fetch_user_playlists_from_ytmusic,  search_artists, fetch_genres, recommend_tracks_by_artists_genres, search_playlists, search_songs
 
)

class ArtistListView(generics.ListAPIView):
    serializer_class = ArtistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 100))
        return Artist.objects.all()[:limit]

class GenreListView(generics.ListAPIView):
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Genre.objects.all()

class ArtistsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        q = request.query_params.get("q")
        limit = int(request.query_params.get("limit", 50))
        if q:
            artists = search_artists(q, limit=limit)
        else:
            artists = fetch_top_artists(limit=limit)
        return Response(artists, status=200)
    
class PlaylistDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, playlist_id):
        data = fetch_playlist_detail(playlist_id, limit=80)
        return Response({
            "id": playlist_id,
            "data": data
        }, status=200)

class ArtistDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, browse_id):
        data = fetch_artist_detail(browse_id, limit=60)
        return Response({
            "id": browse_id,
            "data": data
        }, status=200)

class GenresView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(fetch_genres(), status=200)

class SavePreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        """
        Body:
        {
          "artist_names": ["Arijit Singh", "Lata Mangeshkar"],
          "genres": ["Chill", "Bollywood"]
        }
        """
        artist_names = request.data.get("artist_names", [])
        genres = request.data.get("genres", [])
        # Upsert minimal Artist/Genre records for M2M relations
        artist_objs = []
        for n in artist_names:
            a, _ = Artist.objects.get_or_create(name=n)
            artist_objs.append(a)
        genre_objs = []
        for g in genres:
            ge, _ = Genre.objects.get_or_create(name=g)
            genre_objs.append(ge)

        request.user.preferred_artists.set(artist_objs)
        request.user.preferred_genres.set(genre_objs)
        return Response({"message": "Preferences saved"}, status=200)

class HomeSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        history = list(UserHistory.objects.filter(user=user)[:10])
        is_new = len(history) == 0
        welcome = "Welcome back!" if not is_new else "Welcome"

        # build recommendations dynamically from preferences
        artists = list(user.preferred_artists.values_list("name", flat=True))
        genres = list(user.preferred_genres.values_list("name", flat=True))
        recommendations = recommend_tracks_by_artists_genres(artists, genres, limit=25)

        playlists = fetch_user_playlists_from_ytmusic(artists, genres, limit=10)

        # top creators direct from charts
        top_creators = fetch_top_artists(limit=15)

        data = {
            "welcome_text": welcome, 
            "is_new_user": is_new,
            "continue_listening": HistoryItemSerializer(history, many=True).data,
            "recommendations": recommendations,
            "playlists_for_you": PlaylistSerializer(playlists, many=True).data,
            "top_creators": top_creators,
        }
        return Response(HomeSummarySerializer(data).data, status=200)

class RecordPlayedView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        """
        { "type": "track", "title": "...", "subtitle": "...", "image_url": "..." }
        """
        item_type = request.data.get("type")
        if item_type not in ["track", "playlist"]:
            return Response({"error": "Invalid type"}, status=400)

        with transaction.atomic():
            obj, created = UserHistory.objects.update_or_create(
            user=request.user,
            yt_video_id=request.data.get("yt_video_id", ""),
            defaults={
                "item_type": item_type,
                "title": request.data.get("title", ""),
                "subtitle": request.data.get("subtitle", ""),
                "image_url": request.data.get("image_url", ""),
                "played_at": timezone.now(),
              }
            )
           # Keep last 10
        ids = list(UserHistory.objects.filter(user=request.user).values_list("id", flat=True)[:10])
        UserHistory.objects.filter(user=request.user).exclude(id__in=ids).delete()
        return Response({"message": "Recorded"}, status=200)

    
class CombinedSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        limit = int(request.query_params.get("limit", 10))

        if not query:
            return Response({"artists": [], "songs": [], "playlists": []}, status=200)

        try:
            artists = search_artists(query, limit=limit)
            songs = search_songs(query, limit=limit)
            playlists = search_playlists(query, limit=limit)
            return Response({
                "artists": artists,
                "songs": songs,
                "playlists": playlists,
            }, status=200)
        except Exception as e:
            return Response({
                "artists": [],
                "songs": [],
                "playlists": [],
                "error": str(e)
            }, status=500)    


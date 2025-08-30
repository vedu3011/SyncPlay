
from ytmusicapi import YTMusic
from django.core.cache import cache
from music.management.commands.seed_music import ARTISTS
import logging
import re
import hashlib

logger = logging.getLogger(__name__)


def get_client():
    try:
        return YTMusic()  # anonymous OK for charts/search
    except Exception:
        return YTMusic()

yt = get_client()

ARTIST_IMAGE_LOOKUP = {a["name"]: a["image_url"] for a in ARTISTS}
DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"


def make_safe_cache_key(*parts):
    """
    Create a cache key that's safe for memcached and other cache backends.
    Replaces problematic characters and hashes long keys.
    """
    # Join all parts with underscores
    key = '_'.join(str(part) for part in parts)
    
    # Replace problematic characters (spaces, special chars) with underscores
    safe_key = re.sub(r'[^\w\-\.]', '_', key)
    
    # If key is too long or still has problematic chars, hash it
    if len(safe_key) > 200:
        safe_key = hashlib.md5(safe_key.encode('utf-8')).hexdigest()
    
    return safe_key


def fetch_top_artists(country="IN", limit=50):
    """
    Uses YouTube charts endpoint to return trending artists.
    """
    cache_key = make_safe_cache_key("top_artists", country, limit)
    cached_artists = cache.get(cache_key)
    if cached_artists:
        return cached_artists

    try:
        charts = yt.get_charts(country=country)
        artists = charts.get("artists", [])[:limit]
        out = []
        for a in artists:
            thumbnail = (a.get("thumbnails") or [{}])[-1].get("url")
            if not thumbnail:
                    # fallback to artist image from seed data or default
                    first_artist_name = a.get("artists", [{}])[0].get("name") if a.get("artists") else None
                    thumbnail = ARTIST_IMAGE_LOOKUP.get(first_artist_name, DEFAULT_IMAGE_URL)
            out.append({
                "name": a.get("name"),
                "image_url": (a.get("thumbnails") or [{}])[-1].get("url"),
                "popularity": a.get("subscribers", 0),
                "browse_id": a.get("browseId") or a.get("channelId"),
            })
        
        # Cache for 2 hours
        cache.set(cache_key, out, timeout=7200)
        return out
    except Exception as e:
        print(f"Error fetching top artists: {e}")
        return []

def search_artists(query, limit=20):
    cache_key = make_safe_cache_key("search_artists", query, limit)
    cached_results = cache.get(cache_key)
    if cached_results:
        return cached_results

    try:
        res = yt.search(query, filter="artists")[:limit]
        out = []
        for a in res:
            thumbnail = (a.get("thumbnails") or [{}])[-1].get("url")
            if not thumbnail:
                    # fallback to artist image from seed data or default
                    first_artist_name = a.get("artists", [{}])[0].get("name") if a.get("artists") else None
                    thumbnail = ARTIST_IMAGE_LOOKUP.get(first_artist_name, DEFAULT_IMAGE_URL)
            out.append({
                "name": a.get("artist"),
                "image_url": (a.get("thumbnails") or [{}])[-1].get("url"),
                "browse_id": a.get("browseId") or a.get("channelId"),
            })
        
        # Cache search results for 2 hour
        cache.set(cache_key, out, timeout=7200)
        return out
    except Exception as e:
        print(f"Error searching artists: {e}")
        return []

def fetch_genres():
    """
    Pull 'moods & genres' categories. We use only genre titles.
    """
    cache_key = make_safe_cache_key("ytmusic_genres")
    cached_genres = cache.get(cache_key)
    if cached_genres:
        return cached_genres

    try:
        cats = yt.get_mood_categories()
        genres = cats.get("genres", [])
        out = []
        for group in genres:
            for item in group.get("moods", []):
                out.append({"name": item["title"], "params": item.get("params")})
        
        # De-dupe by name
        seen, uniq = set(), []
        for g in out:
            if g["name"] not in seen:
                uniq.append(g)
                seen.add(g["name"])
        
        # Cache genres for 24 hours (they don't change often)
        cache.set(cache_key, uniq, timeout=86400)
        return uniq
    except Exception as e:
        print(f"Error fetching genres: {e}")
        return []

def recommend_tracks_by_artists_genres(artists: list[str], genres: list[str], limit=12):
    """
    Simple rule-based: search songs for each artist/genre and collate.
    """
    # Create a deterministic cache key from sorted artists and genres
    sorted_items = sorted(artists + genres)
    cache_key = make_safe_cache_key("recommendations", hashlib.md5(''.join(sorted_items).encode()).hexdigest(), limit)
    cached_tracks = cache.get(cache_key)
    if cached_tracks:
        return cached_tracks

    tracks = []
    try:
        # fetch per artist
        for name in artists:
            r = yt.search(name, filter="songs")[:4]
            for s in r:
                thumbnail = (s.get("thumbnails") or [{}])[-1].get("url")
                if not thumbnail:
                    # fallback to artist image from seed data or default
                    first_artist_name = s.get("artists", [{}])[0].get("name") if s.get("artists") else None
                    thumbnail = ARTIST_IMAGE_LOOKUP.get(first_artist_name, DEFAULT_IMAGE_URL)
                tracks.append({
                    "title": s.get("title"),
                    "artist_name": ", ".join([a["name"] for a in s.get("artists", [])]) or name,
                    "yt_video_id": s.get("videoId"),
                    "thumbnail_url": (s.get("thumbnails") or [{}])[-1].get("url"),
                    "duration_sec": 0,
                })
        
        # fetch per genre
        for g in genres:
            r = yt.search(g, filter="songs")[:3]
            for s in r:
                 thumbnail = (s.get("thumbnails") or [{}])[-1].get("url")
                 if not thumbnail:
                    first_artist_name = s.get("artists", [{}])[0].get("name") if s.get("artists") else None
                    thumbnail = ARTIST_IMAGE_LOOKUP.get(first_artist_name, DEFAULT_IMAGE_URL)
                 tracks.append({
                    "title": s.get("title"),
                    "artist_name": ", ".join([a["name"] for a in s.get("artists", [])]),
                    "yt_video_id": s.get("videoId"),
                    "thumbnail_url": (s.get("thumbnails") or [{}])[-1].get("url"),
                    "duration_sec": 0,
                })
        
        # cut to limit and de-dup by video id
        out, seen = [], set()
        for t in tracks:
            vid = t["yt_video_id"]
            if vid and vid not in seen:
                out.append(t)
                seen.add(vid)
            if len(out) >= limit:
                break
        
        # Cache recommendations for 1 hour
        cache.set(cache_key, out, timeout=7200)
        return out
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return []

def fetch_playlist_songs(playlist_id, limit=20):
    """
    Fetch songs from a specific YouTube Music playlist
    """
    cache_key = make_safe_cache_key("playlist_songs", playlist_id, limit)
    cached_songs = cache.get(cache_key)
    if cached_songs:
        return cached_songs
    
    try:
        playlist_data = yt.get_playlist(playlist_id, limit=limit)
        logger.debug(f"Playlist data for {playlist_id}: {playlist_data}")
        
        songs = []
        
        for track in playlist_data.get("tracks", []):
            if track.get("videoId"):  # Only include valid tracks
                thumbnail = (track.get("thumbnails") or [{}])[-1].get("url")
                if not thumbnail:
                    # fallback to artist image from seed data or default
                    first_artist_name = track.get("artists", [{}])[0].get("name") if track.get("artists") else None
                    thumbnail = ARTIST_IMAGE_LOOKUP.get(first_artist_name, DEFAULT_IMAGE_URL)
                songs.append({
                    "title": track.get("title"),
                    "artist_name": ", ".join([a["name"] for a in track.get("artists", [])]),
                    "yt_video_id": track.get("videoId"),
                    "thumbnail_url": (track.get("thumbnails") or [{}])[-1].get("url"),
                    "duration_sec": track.get("duration_seconds", 0),
                })
        
        # Cache playlist songs for 1 hour
        cache.set(cache_key, songs, timeout=3600)
        return songs
        
    except Exception as e:
        print(f"Error fetching playlist songs for {playlist_id}: {e}")
        logger.error(f"Error fetching playlist songs for playlist ID {playlist_id}: {e}")
        return []

def fetch_user_playlists_from_ytmusic(artists: list[str], genres: list[str], limit=6):
    """Fetch actual playlists from YouTube Music with their songs"""
    # Create a deterministic cache key from sorted artists and genres
    sorted_items = sorted(artists + genres)
    cache_key = make_safe_cache_key("playlists", hashlib.md5(''.join(sorted_items).encode()).hexdigest(), limit)
    cached_playlists = cache.get(cache_key)
    if cached_playlists:
        return cached_playlists

    playlists = []
    try:
        # Method 1: Search for playlists by artist names
        for artist in artists[:2]:  # Limit to avoid too many requests
            search_results = yt.search(f"{artist} playlist", filter="playlists")
            for playlist in search_results[:2]:
                playlist_id = playlist.get("browseId")
                if playlist_id:
                    # Fetch songs for this playlist
                    songs = fetch_playlist_songs(playlist_id, limit=15)
                    
                    playlists.append({
                        "id": playlist_id,
                        "title": playlist.get("title"),
                        "cover_url": (playlist.get("thumbnails") or [{}])[-1].get("url"),
                        "source": "youtube_music",
                        "track_count": len(songs),
                        "songs": songs  # Include actual songs
                    })
        
        # Method 2: Search for genre-based playlists
        for genre in genres[:2]:
            search_results = yt.search(f"{genre} playlist", filter="playlists")
            for playlist in search_results[:1]:
                playlist_id = playlist.get("browseId")
                if playlist_id:
                    # Fetch songs for this playlist
                    songs = fetch_playlist_songs(playlist_id, limit=15)
                    
                    playlists.append({
                        "id": playlist_id,
                        "title": playlist.get("title"),
                        "cover_url": (playlist.get("thumbnails") or [{}])[-1].get("url"),
                        "source": "youtube_music",
                        "track_count": len(songs),
                        "songs": songs  # Include actual songs
                    })
        
        # Filter out playlists with no songs and limit results
        valid_playlists = [p for p in playlists if p["track_count"] > 0][:limit]
        
        # Cache playlists for 2 hours
        cache.set(cache_key, valid_playlists, timeout=7200)
        return valid_playlists
        
    except Exception as e:
        print(f"Error fetching playlists: {e}")
        return []


def fetch_playlist_detail(playlist_id, limit=80):
    """Full playlist detail with tracks."""
    cache_key = make_safe_cache_key("playlist_detail", playlist_id, limit)
    if cached := cache.get(cache_key):
        return cached
    try:
        p = yt.get_playlist(playlist_id, limit=limit)
        songs = []
        for t in p.get("tracks", []):
            if not t.get("videoId"):
                continue
            songs.append({
                "title": t.get("title"),
                "artist_name": ", ".join([a["name"] for a in t.get("artists", [])]),
                "yt_video_id": t.get("videoId"),
                "thumbnail_url": (t.get("thumbnails") or [{}])[-1].get("url"),
                "duration_sec": t.get("duration_seconds", 0),
            })
        data = {
            "id": playlist_id,
            "title": p.get("title"),
            "description": p.get("description", ""),
            "cover_url": (p.get("thumbnails") or [{}])[-1].get("url"),
            "track_count": len(songs),
            "songs": songs,
        }
        cache.set(cache_key, data, 3600)
        return data
    except Exception as e:
        print("fetch_playlist_detail error:", e)
        return None

def fetch_artist_detail(browse_id, limit=60):
    """Artist info + top songs."""
    cache_key = make_safe_cache_key("artist_detail", browse_id, limit)
    if cached := cache.get(cache_key):
        return cached
    try:
        a = yt.get_artist(browse_id)
        name = a.get("name")
        thumbnails = a.get("thumbnails") or []
        image_url = thumbnails[-1]["url"] if thumbnails else None

        # Try top songs directly from artist
        songs = []
        tops = a.get("songs", {}).get("results") or []
        for s in tops[:limit]:
            songs.append({
                "title": s.get("title"),
                "artist_name": ", ".join([ar["name"] for ar in s.get("artists", [])]) or name,
                "yt_video_id": s.get("videoId"),
                "thumbnail_url": (s.get("thumbnails") or [{}])[-1].get("url"),
                "duration_sec": s.get("duration_seconds", 0),
            })

        # Fallback / extend via search
        if len(songs) < limit:
            res = yt.search(name, filter="songs")
            for s in res:
                if len(songs) >= limit: break
                songs.append({
                    "title": s.get("title"),
                    "artist_name": ", ".join([ar["name"] for ar in s.get("artists", [])]) or name,
                    "yt_video_id": s.get("videoId"),
                    "thumbnail_url": (s.get("thumbnails") or [{}])[-1].get("url"),
                    "duration_sec": 0,
                })

        data = {
            "browse_id": browse_id,
            "name": name,
            "image_url": image_url,
            "songs": [t for t in songs if t["yt_video_id"]],
        }
        cache.set(cache_key, data, 3600)
        return data
    except Exception as e:
        print("fetch_artist_detail error:", e)
        return None


def search_songs(query, limit=20):
    cache_key = make_safe_cache_key("search_songs", query, limit)
    cached_results = cache.get(cache_key)
    if cached_results:
        return cached_results

    try:
        results = yt.search(query, filter="songs")[:limit]
        out = []
        for s in results:
            out.append({
                "title": s.get("title"),
                "artist_name": ", ".join([a["name"] for a in s.get("artists", [])]),
                "yt_video_id": s.get("videoId"),
                "thumbnail_url": (s.get("thumbnails") or [{}])[-1].get("url"),
                "duration_sec": s.get("duration_seconds", 0),
            })
        cache.set(cache_key, out, timeout=7200)
        return out
    except Exception as e:
        print(f"Error searching songs: {e}")
        return []

def search_playlists(query, limit=20):
    cache_key = make_safe_cache_key("search_playlists", query, limit)
    cached_results = cache.get(cache_key)
    if cached_results:
        return cached_results

    try:
        results = yt.search(query, filter="playlists")[:limit]
        out = []
        for p in results:
            out.append({
                "id": p.get("browseId"),
                "title": p.get("title"),
                "cover_url": (p.get("thumbnails") or [{}])[-1].get("url"),
                "track_count": p.get("trackCount", 0),
            })
        cache.set(cache_key, out, timeout=7200)
        return out
    except Exception as e:
        print(f"Error searching playlists: {e}")
        return []
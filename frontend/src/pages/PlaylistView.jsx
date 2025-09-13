


// src/pages/PlaylistView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../lib/axios";
import {
  addTrackToPlaylistApi,
  removeTrackFromPlaylistApi,
  savePlaylistAsPersonalApi,
  getSearchResults,
} from "../lib/api";
// import useJamSocket from "../hooks/useJamSocket";
import useUnifiedSocket from "../hooks/useUnifiedSocket";
import { usePlayer } from "../contexts/PlayerContext";


export default function PlaylistView() {
  const { id } = useParams(); // playlist ID
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  


  // Extract friendship ID from loaded playlist for WS connection
  const friendshipId = playlist?.friendship_id || null;
  const wsParams = friendshipId ? friendshipId : null;

  // Use friendship ID to connect to Jam WebSocket room, includes WS message handling
  // const { connected, send } = useJamSocket(wsParams);
  const { 
  connected, send,} = useUnifiedSocket(wsParams, null); // roomId=wsParams, chatId=null
  // const { connected, send } = useJamSocket(friendshipId);
  console.log("[WS] Connecting jam socket for friendshipId:", friendshipId);

  // Player context with playSong and seekTo functions to trigger local playback
  const { playSong, seekTo } = usePlayer();

  // Load playlist data including friendship_id
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await API.get(`/jam/playlists/${id}/`);
        setPlaylist(res.data);
        setError(null);
      } catch (e) {
        if (e.response?.status === 404) {
          setError("Playlist not found");
        } else if (e.response?.status === 403) {
          setError("You don't have permission to view this playlist");
        } else {
          setError("Failed to load playlist");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Search for songs to add
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await getSearchResults(searchQuery, 12);
        const tracks = res.songs || res.tracks || res || [];
        setSearchResults(tracks);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refetch playlist after changes
  const refetchPlaylist = async () => {
    try {
      const res = await API.get(`/jam/playlists/${id}/`);
      setPlaylist(res.data);
    } catch {
      // fail silently
    }
  };

  // Add track to playlist
  const handleAdd = async (track) => {
    try {
      await addTrackToPlaylistApi(id, {
        video_id: track.yt_video_id || track.videoId || track.video_id,
        title: track.title,
        artist_name: track.artist_name || track.artist,
        thumbnail_url: track.thumbnail_url || track.thumbnail,
        duration_sec: track.duration_sec || track.durationSeconds || 0,
      });
      await refetchPlaylist();
      setSearchQuery("");
      setSearchResults([]);
    } catch (e) {
      alert(
        e.response?.status === 403
          ? "You don't have permission to add tracks to this playlist"
          : "Failed to add track"
      );
    }
  };

  // Remove track from playlist
  const handleRemove = async (videoId) => {
    if (!confirm("Remove this track from the playlist?")) return;
    try {
      await removeTrackFromPlaylistApi(id, videoId);
      await refetchPlaylist();
    } catch (e) {
      alert(
        e.response?.status === 403
          ? "You don't have permission to remove tracks from this playlist"
          : "Failed to remove track"
      );
    }
  };

  // Save playlist to personal library
  const handleSavePersonal = async () => {
    try {
      await savePlaylistAsPersonalApi(id);
      alert("Playlist saved to your personal library!");
    } catch {
      alert("Could not save playlist to your library");
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Play track locally and send play command to jam WS (using refined hook with WS message handling)
  const playAndSyncTrack = (track) => {
    const ytId = track.yt_video_id || track.video_id;
    if (!ytId) {
      alert("Invalid track ID");
      console.error("[playAndSyncTrack] Missing yt_video_id or video_id in track:", track);
      return;
    }

    console.log("[playAndSyncTrack] Playing locally yt_video_id:", ytId, "title:", track.title);

    playSong({ yt_video_id: ytId, title: track.title, artist_name: track.artist_name }, { type: "playlist", songs: playlist?.tracks || [] });
    seekTo(0);

    if (connected) {
      console.log("[playAndSyncTrack] Sending 'play' WS message for track_id:", ytId);
      console.log("[WS SEND] Sending 'play' message:", {
        type: "play",
        track_id: ytId,
        track_title: track.title,
        track_artist: track.artist_name,
        position: 0,
      });
      send({
        type: "play",
        track_id: ytId,
        track_title: track.title,
        track_artist: track.artist_name,
        position: 0,
      });
    } else {
      console.warn("[playAndSyncTrack] Jam socket not connected — local playback only");
      alert("Not connected to jam session — playing locally only");
    }
  };

  // Start jam by playing first track synced
  const handleStartJam = () => {
    if (!playlist?.tracks?.length) {
      alert("Playlist is empty");
      return;
    }
    playAndSyncTrack(playlist.tracks[0]);
  };

  // Play button handler for each track
  const handlePlaySong = (track) => {
    playAndSyncTrack(track);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-2" />
          <div>Loading playlist...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠ {error}</div>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div>Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pb-20">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goBack}
            className="text-gray-400 hover:text-white text-lg mr-3"
          >
            ←
          </button>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-xl font-bold">{playlist.name}</h1>
            <button
              onClick={handleStartJam}
              disabled={!connected}
              className="px-3 py-2 bg-pink-600 rounded text-sm"
              title={
                connected
                  ? "Start playing playlist for all participants"
                  : "Connect to jam session to start"
              }
            >
              Start Jam
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSavePersonal}
              className="px-3 py-2 bg-pink-500 rounded hover:bg-pink-600 transition text-sm"
            >
              Save to My Library
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4">
        <div className="mb-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs to add..."
            className="w-full p-3 rounded bg-[#161a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-gray-300 mb-3">Search Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((s, i) => {
                const videoId = s.yt_video_id || s.videoId || s.video_id || i;
                return (
                  <div
                    key={videoId}
                    className="flex items-center gap-3 bg-[#111216] p-3 rounded hover:bg-[#151924] transition"
                  >
                    <img
                      src={s.thumbnail_url || s.thumbnail}
                      className="w-12 h-12 object-cover rounded"
                      alt=""
                      onError={(e) =>
                        (e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxNi4yNjggMzIgMTAgMjUuNzMyIDEwIDE4UzE2LjI2OCA0IDI0IDRTMzggMTAuMjY4IDM4IDE4UzMxLjczMiAzMiAyNCAzMlpNMjQgMjhDMjkuNTI0IDI4IDM0IDIzLjUyNCAzNCAxOFMyOS41MjQgOCAyNCA4UzE0IDEyLjQ3NiAxNCAxOFMxOC40NzYgMjggMjQgMjhaIiBmaWxsPSIjNzc3Ii8+Cjwvc3ZnPgo="
                )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white truncate">
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {s.artist_name || s.artist || "Unknown Artist"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(s)}
                      className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 transition text-sm flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Current Tracks */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Tracks</h2>
        {(!playlist.tracks || playlist.tracks.length === 0) ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🎵</div>
            <div>No tracks yet</div>
            <div className="text-sm opacity-75">Search and add some songs above</div>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.tracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 bg-[#111216] p-3 rounded hover:bg-[#151924] transition"
              >
                <img
                  src={t.thumbnail_url}
                  className="w-12 h-12 object-cover rounded"
                  alt=""
                  onError={(e) =>
                    (e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxNi4yNjggMzIgMTAgMjUuNzMyIDEwIDE4UzE2LjI2OCA0IDI0IDRTMzggMTAuMjY4IDM4IDE4UzMxLjczMiAzMiAyNCAzMlpNMjQgMjhDMjkuNTI0IDI4IDM0IDIzLjUyNCAzNCAxOFMyOS41MjQgOCAyNCA4UzE0IDEyLjQ3NiAxNCAxOFMxOC40NzYgMjggMjQgMjhaIiBmaWxsPSIjNzc3Ii8+Cjwvc3ZnPgo="
             ) }
                    />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white truncate">{t.title}</div>
                  <div className="text-xs text-gray-400 truncate">{t.artist_name}</div>
                  {t.duration_sec > 0 && (
                    <div className="text-xs text-gray-500">
                      {Math.floor(t.duration_sec / 60)}:{String(t.duration_sec % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
                {/* Play button to sync play */}
                <button
                  onClick={() => handlePlaySong(t)}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition text-sm flex-shrink-0"
                >
                  Play
                </button>
                <button
                  onClick={() => handleRemove(t.video_id)}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition text-sm flex-shrink-0"
                  style={{ marginLeft: "0.5rem" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


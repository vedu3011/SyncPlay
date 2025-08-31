
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlaylistDetail, getCustomPlaylistDetail, getSearchResults, addTrackToPlaylist,createPlaylist } from "../lib/api";
import BottomNav from "../components/BottomNav";
import { usePlayer } from "../contexts/PlayerContext";
import { Play, ArrowLeft, MoreHorizontal } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addingTrackIds, setAddingTrackIds] = useState(new Set());
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine if ID is number => custom playlist or string => external playlist
        let result = null;
        if (/^\d+$/.test(id)) {
          result = await getCustomPlaylistDetail(id);
        } else {
          result = await getPlaylistDetail(id);
        }
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const isExternalPlaylist = Boolean(data?.id && typeof data.id === "string" && data.id.startsWith("VL"));

const handleSavePlaylist = async () => {
  try {
    const newPlaylist = await createPlaylist(data.title || data.name || "My Playlist");

    // Create an array of promises for adding tracks
    const addTrackPromises = (data.songs || []).map(track => {
      const payload = {
        video_id: track.video_id || track.yt_video_id,
        title: track.title,
        artist_name: track.artist_name || "",
        thumbnail_url: track.thumbnail_url || "",
        duration_sec: track.duration_sec || 0,
      };
      return addTrackToPlaylist(newPlaylist.id, payload);
    });

    // Await all the add track API calls in parallel
    await Promise.all(addTrackPromises);

    alert("Playlist saved to your account!");
  } catch (e) {
    alert("Failed to save playlist.");
  }
};



  const handlePlaySong = (song, songIndex = 0) => {
    const context = {
      type: 'playlist',
      songs: data.songs || data.tracks || [],
      playlistId: data.id,
    };
    playSong(song, context);
  };

  const handlePlayPlaylist = () => {
    if ((data.songs || data.tracks)?.length > 0) {
      handlePlaySong((data.songs || data.tracks)[0], 0);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await getSearchResults(searchQuery);
    setSearchResults(results);
  };
 
  // console.log("Playlist data:", data);


  const handleAddTrack = async (track) => {
    if (addingTrackIds.has(track.video_id)) return;
    setAddingTrackIds(prev => new Set(prev).add(track.video_id));
    try {
      await addTrackToPlaylist(id, track);
      alert(`${track.title} added!`);
      const updated = await getCustomPlaylistDetail(id);
      setData(updated);
      setSearchResults([]);
      setSearchQuery('');
    } catch (e) {
      alert("Failed to add track");
    } finally {
      setAddingTrackIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.video_id);
        return newSet;
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mx-auto mb-2"></div>
          <div>Loading playlist...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">Error</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-pink-500 px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white p-4 flex items-center justify-center">
        <div>No playlist data found</div>
      </div>
    );
  }

  const songs = data.songs || data.tracks || [];

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pb-16">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => window.history.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-sm text-pink-400">+ Add Songs</div>
        </div>

        {/* Playlist Info */}
        <div className="mb-6">
          <div className="w-full h-48 rounded-xl overflow-hidden bg-[#222733] mb-4 relative group">
            {data.cover_url && (
              <img 
                src={data.cover_url} 
                alt={data.title || "Playlist cover"}
                className="w-full h-full object-cover" 
              />
            )}
            {songs.length > 0 && (
              <button
                onClick={handlePlayPlaylist}
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all"
              >
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-600">
                  <Play size={24} className="text-white ml-1" />
                </div>
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">{data.title || data.name || "Untitled Playlist"}</h1>
          {data.description && <p className="text-gray-400 text-sm mb-2">{data.description}</p>}
          <p className="text-gray-400 text-xs">{songs.length} songs</p>
           {isExternalPlaylist && (
          <button
            className="px-4 py-2 mb-4 bg-pink-500 rounded text-white"
            onClick={handleSavePlaylist}
          >
            Save Playlist
          </button>
        )}
        </div>

        {/* Song Search & Add */}
        {!isExternalPlaylist && (
          <>
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search songs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <button onClick={handleSearch} className="mt-2 px-4 py-1 bg-pink-500 rounded hover:bg-pink-600">
            Search
          </button>

          <div className="mt-4 space-y-2 max-h-60 overflow-auto">
            {searchResults.map(track => (
              <div key={track.video_id} className="flex justify-between items-center bg-[#222733] p-2 rounded">
                <div>{track.title} - {track.artist_name || 'Unknown'}</div>
                <button
                  onClick={() => handleAddTrack(track)}
                  disabled={addingTrackIds.has(track.video_id)}
                  className="text-pink-500 hover:underline"
                >
                  {addingTrackIds.has(track.video_id) ? 'Adding...' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
        </> )}

        {/* Songs List */}
        <div className="space-y-2 mt-6">
          {songs.length > 0 ? (
            songs.map((song, idx) => (
              <div 
                key={song.yt_video_id || idx} 
                className="flex items-center gap-3 p-3 rounded-xl bg-[#161a23] hover:bg-[#1a1f28] transition-colors group cursor-pointer"
                onClick={() => handlePlaySong(song, idx)}
              >
                {/* Track Number / Play Icon */}
                <div className="w-6 text-center flex-shrink-0">
                  <span className="text-gray-400 text-sm group-hover:hidden">
                    {idx + 1}
                  </span>
                  <Play size={16} className="text-pink-400 hidden group-hover:block" />
                </div>

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                  {song.thumbnail_url ? (
                    <img 
                      src={song.thumbnail_url} 
                      alt={song.title}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">♪</span>
                    </div>
                  )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-white group-hover:text-pink-400 transition-colors">
                    {song.title || "Unknown Track"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {song.artist_name || "Unknown Artist"}
                  </div>
                </div>

                {/* Duration */}
                {song.duration_sec > 0 && (
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {Math.floor(song.duration_sec / 60)}:{(song.duration_sec % 60).toString().padStart(2, '0')}
                  </div>
                )}

                {/* More Options */}
                <button 
                  className="text-gray-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle more options
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))
          ) :
            
           (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No songs found in this playlist</div>
              <button className="text-pink-400 hover:text-pink-300 transition-colors">
                + Add Songs
              </button>
            </div> 
          )
         
          }
        </div>
        

      </div>
      <BottomNav />
    </div>
  );
}

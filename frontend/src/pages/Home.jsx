
// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { getHomeSummary } from "../lib/api";
import { usePlayer } from "../contexts/PlayerContext";
import { Play } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    (async () => {
      try {
        setData(await getHomeSummary());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePlaySong = (song, context = null) => {
    playSong(song, context);
  };

  const handlePlayFromPlaylist = (song, playlist) => {
    const context = {
      type: 'playlist',
      songs: playlist.songs,
    };
    playSong(song, context);
  };

  const navigateToArtist = (browseId) => {
    // In a real app, this would use React Router
    window.location.href = `/artist/${browseId}`;
  };

  const navigateToPlaylist = (id) => {
    window.location.href = `/playlist/${id}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0d0f12] text-white p-4">Loading…</div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-[#0d0f12] text-white p-4">No data</div>;
  }

  const SectionTitle = ({ children }) => (
    <h2 className="text-base font-semibold mt-6 mb-3">{children}</h2>
  );
  
  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">{data.welcome_text}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center font-bold">S</div>
        </div>

        {/* Continue Listening */}
        {!data.is_new_user && data.continue_listening?.length > 0 && (
          <>
            <SectionTitle>Continue Listening</SectionTitle>
            <div className="flex gap-3 overflow-x-auto">
              {data.continue_listening.map((item, idx) => (
                <div
                  className="min-w-[140px] bg-[#161a23] rounded-xl overflow-hidden cursor-pointer hover:bg-[#1a1f28] transition-colors group"
                  key={idx}
                  onClick={() => {
                    // For history items, we need to reconstruct song data
                    const song = {
                      title: item.title,
                      artist_name: item.subtitle,
                      thumbnail_url: item.image_url,
                      yt_video_id: item.yt_video_id, // This might need to be stored in history
                    };
                    if (song.yt_video_id) {
                      handlePlaySong(song);
                    }
                  }}
                >
                  <div className="w-full h-24 bg-gray-700 relative">
                    {item.image_url && (
                      <img src={item.image_url} className="w-full h-full object-cover" alt={item.title} />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                      <Play size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-semibold truncate">{item.title}</div>
                    <div className="text-xs text-gray-400 truncate">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recommendations */}
        <SectionTitle>{data.is_new_user ? "For you" : "Your Top Mixes"}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {data.recommendations?.map((song, idx) => (
            <div 
              className="bg-[#161a23] rounded-xl overflow-hidden cursor-pointer hover:bg-[#1a1f28] transition-colors group" 
              key={idx}
              onClick={() => handlePlaySong(song, { type: 'recommendations' })}
            >
              <div className="w-full h-24 bg-gray-700 relative">
                {song.thumbnail_url && (
                  <img src={song.thumbnail_url} className="w-full h-full object-cover" alt={song.title} />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="text-sm font-semibold truncate">{song.title}</div>
                <div className="text-xs text-gray-400 truncate">{song.artist_name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Creators */}
        <SectionTitle>Top Creators</SectionTitle>
        <div className="flex gap-4 overflow-x-auto">
          {data.top_creators?.map((a, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigateToArtist(a.browse_id)}
            >
             <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-700">
               {a.image_url ? (
               <img src={a.image_url} className="w-full h-full object-cover" />
               ) : <div className="w-full h-full bg-[#222733]" />}
              </div>
              <div className="text-xs mt-2 max-w-[70px] truncate text-center">{a.name}</div>
            </div>
            ))}
         </div>

        {/* Playlists for you */}
        <SectionTitle>Playlists for you</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {data.playlists_for_you?.map((playlist, idx) => (
            <div key={idx} className="bg-[#161a23] rounded-xl overflow-hidden group relative">
              <div className="cursor-pointer" onClick={() => navigateToPlaylist(playlist.id)}>
                <div className="w-full h-24 bg-gray-700 relative">
                  {!!playlist.cover_url && <img src={playlist.cover_url} className="w-full h-full object-cover" />}
                  
                  {/* Play Button Overlay */}
                  {playlist.songs && playlist.songs.length > 0 && (
                    <button
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlayFromPlaylist(playlist.songs[0], playlist);
                      }}
                    >
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white ml-0.5" />
                      </div>
                    </button>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-sm font-semibold truncate">{playlist.title}</div>
                  <div className="text-xs text-gray-400 truncate">{playlist.track_count} songs</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
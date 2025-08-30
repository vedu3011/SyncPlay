// src/components/FullPlayer.jsx
// import React, { useEffect } from 'react';
import React, { useEffect, useState } from 'react';

import { usePlayer } from '../contexts/PlayerContext';
import { useLocation } from 'react-router-dom';
import { toggleFavourite, getMyPlaylists, addTrackToPlaylist } from "../lib/api";

import { 
  ArrowLeft, 
  MoreHorizontal, 
  Heart, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward 
} from 'lucide-react';

export default function FullPlayer() {
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [toast, setToast] = useState(null);
  const { playSong } = usePlayer();

  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    isFullPlayerOpen,
    handlePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setFullPlayer,
  } = usePlayer();

  // Auto-close full player when route changes
  useEffect(() => {
    if (isFullPlayerOpen) {
      setFullPlayer(false);
    }
  }, [location.pathname]); // Close when pathname changes

  if (!isFullPlayerOpen || !currentSong) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const seekTime = percentage * duration;
      seekTo(seekTime);
    }
  };
  
  

const trackPayload = currentSong ? {
  video_id: currentSong.yt_video_id,
  title: currentSong.title,
  artist_name: currentSong.artist_name || "",
  thumbnail_url: currentSong.thumbnail_url || "",
  duration_sec: currentSong.duration_sec || 0,
} : null;


const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

const onToggleFavourite = async () => {
    if (!trackPayload) return;
    try {
      const res = await toggleFavourite(trackPayload);
      showToast(res.favourited ? "Added to favourites" : "Removed from favourites");
    } catch (e) {
      showToast("Failed to toggle favourite");
      console.error(e);
    }
  };

const openAddToPlaylist = async () => {
  try {
    const pls = await getMyPlaylists();
    setMyPlaylists(pls.filter(p => !p.is_favourites)); // only custom
    setShowAddModal(true);
  } catch (e) { console.error(e); }
};

const addToPlaylist = async (playlistId) => {
  try {
    await addTrackToPlaylist(playlistId, trackPayload);
    setShowAddModal(false);
    showToast("Added to Playlist");
  } catch (e) {
    console.error(e);
    alert("Failed to add");
  }
};



  // Get upcoming songs (next songs in queue)
  const upcomingSongs = queue.slice(currentIndex + 1, currentIndex + 6);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0d0f12',
        color: 'white',
        zIndex: 15000,
        overflowY: 'auto'
      }}
    >
      <div className="p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setFullPlayer(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-sm text-gray-400">Now Playing</div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Song Title and Artist */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{currentSong.title}</h1>
          <p className="text-gray-400 text-lg">{currentSong.artist_name}</p>
        </div>

        {/* Circular Album Art with Progress Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Progress Ring */}
            <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(75, 85, 99, 0.3)"
                strokeWidth="2"
                fill="none"
              />
              {/* Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgb(236, 72, 153)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
            
            {/* Album Art */}
            <div className="absolute inset-6 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
              {currentSong.thumbnail_url ? (
                <img
                  src={currentSong.thumbnail_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">♪</span>
                </div>
              )}
            </div>

            {/* Time Display */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <span className="text-sm text-gray-400">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 mb-8">
         
          <button
              onClick={onToggleFavourite}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
              < Heart size={24} className="text-gray-400 hover:text-pink-400" />
           </button>
           <button
             onClick={openAddToPlaylist}
             className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-full transition-colors"
            >
            <Plus size={20} />
             <span className="font-medium">Add to Playlist</span>
           </button>
          
          {/* Jam Together Button (replacing share) */}
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-full transition-colors">
            <Plus size={20} />
            <span className="font-medium">Jam Together</span>
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack size={28} />
          </button>

          <button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={32} className="text-white" />
            ) : (
              <Play size={32} className="text-white ml-1" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= queue.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward size={28} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-pink-500 rounded-full transition-all group-hover:bg-pink-400 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Upcoming Songs */}
        {upcomingSongs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Up Next</h3>
            {upcomingSongs.map((song, index) => (
              <div
               key={song.yt_video_id || index}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#161a23] hover:bg-[#1a1f28] transition-colors"
                onClick={() => playSong(song, { type: 'queue', songs: upcomingSongs })}>
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
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{song.title}</div>
                  <div className="text-xs text-gray-400 truncate">{song.artist_name}</div>
                </div>
                <button className="text-gray-400 hover:text-white p-2">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
     {/* Toast */}
    {toast && (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-6 py-2 rounded z-50">
        {toast}
      </div>
    )}

    {/* Add to Playlist Modal */}
    {showAddModal && (
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000
        }}
        onClick={() => setShowAddModal(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ background: '#161a23', padding: '1rem', borderRadius: '0.75rem', width: '90%', maxWidth: 360 }}
        >
          <div className="text-lg font-semibold mb-2">Add to Playlist</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {myPlaylists.map(pl => (
              <button
                key={pl.id}
                onClick={() => addToPlaylist(pl.id)}
                className="w-full text-left bg-[#1a1f28] p-2 rounded hover:bg-[#222733]"
              >
                {pl.name} <span className="text-xs text-gray-400">({pl.track_count})</span>
              </button>
            ))}
            {myPlaylists.length === 0 && <div className="text-sm text-gray-400">No custom playlists yet.</div>}
          </div>
          <div className="mt-3 text-right">
            <button onClick={() => setShowAddModal(false)} className="px-3 py-1 bg-gray-700 rounded">Close</button>
          </div>
        </div>
      </div>
    )}

    </div>
  


      </div>
    
  );
}
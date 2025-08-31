
import { useEffect, useState } from "react";
import { getMyPlaylists, createPlaylist, getPlaylistDetail, addTrackToPlaylist } from "../lib/api";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PlaylistCreateModal from "../components/PlaylistCreateModal.jsx";

export default function PlaylistsPage() {
  const nav = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // For "Add entire playlist to custom playlist" modal
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState('');
  const [targetPlaylists, setTargetPlaylists] = useState([]);
  const [processingAdd, setProcessingAdd] = useState(false);

  const load = async () => {
    const data = await getMyPlaylists();
    setPlaylists(data);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (name) => {
    try {
      const pl = await createPlaylist(name);
      setShowCreateModal(false);
      await load();
      nav(`/my-playlist/${pl.id}`);
    } catch (e) {
      alert("Failed to create playlist");
    }
  };

  const openAddToCustomModal = async (playlist) => {
    try {
      const plDetails = await getPlaylistDetail(playlist.id || playlist.yt_playlist_id);
      const tracks = plDetails.tracks || plDetails.songs || [];
      setSelectedPlaylistTracks(tracks);
      setSelectedPlaylistName(playlist.name || playlist.title);
      const customs = playlists.filter(p => !p.is_favourites);
      setTargetPlaylists(customs);
      setAddToPlaylistModalOpen(true);
    } catch (e) {
      alert("Failed to load playlist tracks");
    }
  };

  const handleAddPlaylistToCustom = async (targetPlaylistId) => {
    setProcessingAdd(true);
    try {
      await Promise.all(selectedPlaylistTracks.map(track =>
        addTrackToPlaylist(targetPlaylistId, {
          video_id: track.video_id || track.yt_video_id,
          title: track.title,
          artist_name: track.artist_name || '',
          thumbnail_url: track.thumbnail_url || '',
          duration_sec: track.duration_sec || 0,
        })
      ));
      alert(`Added "${selectedPlaylistName}" tracks to your playlist`);
      setAddToPlaylistModalOpen(false);
    } catch (e) {
      alert("Failed to add tracks");
    } finally {
      setProcessingAdd(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pb-16 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Your Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 rounded-lg bg-pink-500"
        >
          + New
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {playlists.map((p) => (
          <div
            key={p.id}
            className="relative bg-[#161a23] rounded-lg p-3 cursor-pointer"
            onClick={() => nav(`/my-playlist/${p.id}`)}
          >
            <div className="w-full h-24 bg-gray-700 rounded-md mb-2 flex items-center justify-center text-4xl">
              {p.is_favourites ? "❤️" : "🎵"}
            </div>
            <div className="text-sm font-semibold truncate">{p.name}</div>
            <div className="text-xs text-gray-400">{p.track_count} songs</div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openAddToCustomModal(p);
              }}
              className="absolute top-2 right-2 text-pink-500 bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center"
              title={`Add ${p.name} to another playlist`}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <BottomNav />

      {/* Playlist Creation Modal */}
      <PlaylistCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreate}
      />

      {/* Add entire playlist to custom playlist modal */}
      {addToPlaylistModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setAddToPlaylistModalOpen(false)}
        >
          <div
            className="bg-[#161a23] p-6 rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg mb-4">Add "{selectedPlaylistName}" tracks to:</h3>
            <div className="max-h-64 overflow-auto mb-4">
              {targetPlaylists.length === 0 ? (
                <p className="text-gray-400">No custom playlists found.</p>
              ) : (
                targetPlaylists.map(tp => (
                  <button
                    key={tp.id}
                    onClick={() => handleAddPlaylistToCustom(tp.id)}
                    disabled={processingAdd}
                    className="block w-full text-left p-2 mb-2 bg-pink-500 hover:bg-pink-600 rounded"
                  >
                    {tp.name} ({tp.track_count})
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setAddToPlaylistModalOpen(false)}
              className="px-3 py-1 bg-gray-700 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

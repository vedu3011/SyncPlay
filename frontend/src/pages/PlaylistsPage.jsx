
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
    <div className="min-h-screen w-screen p-[12px] pb-[72px] bg-[#010101] text-white">
      <div className="flex items-center justify-between mb-[8px]">
        <h1 className="text-2xl font-semibold">Your Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg text-[#dd2476] font-xs"
        >
          + New
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[20px]">
        {playlists.map((p) => (
          <div
            key={p.id}
            className="relative bg-[#0E1516] rounded-[12px] p-3 cursor-pointer"
            onClick={() => nav(`/my-playlist/${p.id}`)}
          >
            <div className="w-full h-[96px] rounded-t-[12px] mb-2 flex items-center justify-center text-[32px]"
            style={{ backgroundImage: 'linear-gradient(135deg, #FF512F, #dd2476)' }}>
              {p.is_favourites ? "❤️" : "🎵"}
            </div>
            <div className="px-[8px] py-[4px]"> 
            <div className="text-sm font-semibold truncate">{p.name}</div>
            <div className="text-[12px] text-[#777]">{p.track_count} songs</div>
            </div>

            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                openAddToCustomModal(p);
              }}
              className="absolute top-2 right-2 text-pink-500 bg-gray-800 rounded-full w-7 h-7 items-center justify-center hidden"
              title={`Add ${p.name} to another playlist`}
            >
              +
            </button> */}
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

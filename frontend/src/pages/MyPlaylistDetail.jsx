// src/pages/MyPlaylistDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCustomPlaylistDetail,
  removeTrackFromPlaylist,
} from "../lib/api";
import { getSearchResults, addTrackToPlaylist,  } from "../lib/api";
import BottomNav from "../components/BottomNav";
import { usePlayer } from "../contexts/PlayerContext";
import { BsFillPlayFill } from "react-icons/bs";
import { IoArrowBackOutline } from "react-icons/io5";

export default function MyPlaylistDetail() {
  const { id } = useParams();
  const [pl, setPl] = useState(null);
  const { playSong } = usePlayer(); // assume you have a helper to play array
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addingTrackIds, setAddingTrackIds] = useState(new Set());
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  // confirmation modal for remove songs
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [trackToRemove, setTrackToRemove] = useState(null);

  const load = async () => {
    const data = await getCustomPlaylistDetail(id);
    setPl(data);
  };

  useEffect(() => { load(); }, [id]);

  if (!pl) return <div className="h-screen w-screen bg-[#010101] text-white flex items-center justify-center">Loading…</div>;

  const onRemove = async (videoId) => {
    await removeTrackFromPlaylist(id, videoId);
  await load();
  setShowConfirmModal(false);
  setTrackToRemove(null);
};

const handleRemoveClick = (track) => {
  console.log("handleRemoveClick called with:", track);
  console.log("Setting showConfirmModal to true");
  setTrackToRemove(track);
  setShowConfirmModal(true);
};

  const startPlayback = () => {
    const queue = pl.tracks.map(t => ({
      title: t.title,
      artist_name: t.artist_name,
      yt_video_id: t.video_id,
      thumbnail_url: t.thumbnail_url,
      duration_sec: t.duration_sec,
    }));
    if (queue.length) playSong(queue, 0);
  };
    
  
const handleSearch = async () => {
  if (!searchQuery.trim()) return;
//   const results = await getSearchResults(searchQuery);
//   setSearchResults(results);
 const res = await getSearchResults(searchQuery);
  const songs = Array.isArray(res.songs) ? res.songs : [];
  setSearchResults(songs);
};

const handleAddTrack = async (track) => {
  const trackId = track.video_id || track.yt_video_id; // ✅ normalize id
  if (addingTrackIds.has(trackId)) return;
  setAddingTrackIds(prev => {
    const next = new Set(prev);
    next.add(trackId);
    return next;
  });
  try {
  const payload = {
    video_id: track.video_id || track.yt_video_id,
    title: track.title,
    artist_name: track.artist_name || "",
    thumbnail_url: track.thumbnail_url || "",
    duration_sec: track.duration_sec || 0,
  };
  await addTrackToPlaylist(id, payload);
  // Show success message instead of alert
    setMessage(`"${track.title}" added to playlist!`);
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds


  // Update UI: remove this track from search results, reset inputs & loading state
  setSearchResults(prev => prev.filter(tr => (tr.video_id || tr.yt_video_id) !== trackId && tr.yt_video_id !== trackId));
  setAddingTrackIds(prev => {
    const next = new Set(prev);
    next.delete(trackId);
    return next;
  });
  setSearchQuery("");
  setSearchVisible(false);

  // Fetch updated playlist content
  const updated = await getCustomPlaylistDetail(id);
  setPl(updated);
} catch (e) {
  // Show error message instead of alert
    setMessage("Failed to add track. Please try again.");
    setMessageType("error");
    setTimeout(() => setMessage(""), 3000);

  setAddingTrackIds(prev => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
  });
  console.log("showConfirmModal:", showConfirmModal, "trackToRemove:", trackToRemove);
}

};

  return (
    <div className="min-h-screen w-screen p-[12px] bg-[#060202] text-white pb-16">
      <div className="p-4">
      {/* Header */}
        <div className="flex items-center justify-between mb-[8px]">
          <button 
            onClick={() => window.history.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <IoArrowBackOutline />
          </button>
        </div>

        {/* Message container */}
{message && (
  <div className={`fixed top-[0px] left-[0px] font-[800] text-center w-full z-50 px-[4px] py-[2px] text-[12px] bg-[#0E1516] shadow-lg ${
      messageType === "success"
        ? "text-[#270]"
        : "text-[#D8000C]"
    }`}>
    {message}
  </div>
)}

        <div className="w-full h-[64px] bg-gray-700 rounded-lg flex items-center justify-center text-[28px] my-[24px] mb-4">
          {pl.is_favourites ? "❤️" : "🎵"}
        </div>
        
           <div className="flex items-center justify-between">
  <div>
    <h1 className="text-[28px] font-bold">{pl.name}</h1>
    <div className="text-xs text-[#777]">{pl.tracks.length} Songs</div>
  </div>
  <div className="flex items-center gap-[16px]">
    <button
      onClick={() => {
    if (!searchVisible) {
      setSearchResults([]);  // ✅ clear old results when closing
      setSearchQuery("");
    }
    setSearchVisible(!searchVisible);
  }}
  className="px-3 py-1 rounded-lg text-[#dd2476]"
  title="Add songs"
>
      +Add
    </button>
    <button
      onClick={startPlayback}
      className="px-4 py-2"
    >
      <BsFillPlayFill className="w-[16px] h-[16px]"/>
    </button>
  </div>
</div>


     {searchVisible && (
  <div className="bg-[#0E1516] rounded-[16px] my-[8px]">
    <div className="flex gap-2 items-center border border-[#555] bg-[#101010] rounded-[16px] py-[8px] px-[12px]">
      <input
        type="text"
        autoFocus
        placeholder="Search songs to add"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
        className="flex-grow mr-[8px] text-white bg-transparent outline-none"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-pink-500 rounded hover:bg-pink-600"
      >
        Search
      </button>
    </div>

    <div className="max-h-48 overflow-auto">
      {searchResults.length === 0 && <p className="text-gray-400 py-[4px] px-[12px]">No results</p>}
      {searchResults.map(track => {
  const trackId = track.video_id || track.yt_video_id; // normalize here too
  return (
    <div key={trackId} className="flex justify-between items-center py-[4px] px-[12px] rounded hover:bg-gray-800">
      <div className="flex gap-[8px] items-center">
        <div>
        {track.thumbnail_url ? (
          <img src={track.thumbnail_url} className="w-[56px] h-[56px] object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div> 
        <div className="text-sm font-semibold">{track.title}</div>
        <div className="text-[12px] text-[#777]">{track.artist_name || "Unknown Artist"}</div>
      </div>
      </div>
      <button
        disabled={addingTrackIds.has(trackId)}
        onClick={() => handleAddTrack(track)}
        className="text-pink-500 hover:underline"
      >
        {addingTrackIds.has(trackId) ? "Adding..." : "Add"}
      </button>
    </div>
  );
})}
    </div>
  </div>
)}


        <div className="my-[16px] space-y-2 flex flex-col gap-[8px]">
  {pl.tracks.map((t) => (
    <div
      key={t.video_id}
      className="rounded-xl overflow-hidden flex items-baseline justify-between relative"
      onClick={() =>
        playSong(
          {
            title: t.title,
            artist_name: t.artist_name,
            yt_video_id: t.video_id,
            thumbnail_url: t.thumbnail_url,
            duration_sec: t.duration_sec,
          },
          { type: "custom_playlist", playlistId: pl.id, songs: pl.tracks }
        )
      }
    >
      <div className="flex gap-[4px] items-center w-full pr-[8px]">
      <div className="w-[64px] h-[64px] bg-gray-700 flex-shrink-0">
        {t.thumbnail_url ? (
          <img src={t.thumbnail_url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-[16px] font-semibold truncate">{t.title}</div>
        <div className="text-[12px] text-gray-400 truncate">{t.artist_name}</div>
      </div>
      </div>
      <button className="absolute bottom-[2px] right-[2px] text-[12px] text-[#FF512F] shrink-0" onClick={(e) => { e.stopPropagation();
         console.log("Remove button clicked for track:", t); // Debug log
        handleRemoveClick(t); }}>
        Remove
      </button>
    </div>
  ))}
  {pl.tracks.length === 0 && (
    <div className="text-center text-gray-400 mt-8">No songs yet.</div>
  )}
</div>

{/* Confirmation Modal */}
{showConfirmModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" style={{ zIndex: 9999 }}>
    <div className="bg-[#161a23] p-6 rounded-lg max-w-sm w-full mx-4 border border-gray-600">
      <h3 className="text-lg font-semibold mb-2 text-white">Remove Track</h3>
      <p className="text-gray-400 mb-4">
        Are you sure you want to remove "{trackToRemove?.title}" from this playlist?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => {
            console.log("Cancel clicked"); // Debug log
            setShowConfirmModal(false);
            setTrackToRemove(null);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            console.log("Remove confirmed for:", trackToRemove?.video_id); // Debug log
            onRemove(trackToRemove?.video_id);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}


      </div>
      <BottomNav />
    </div>
  );
}

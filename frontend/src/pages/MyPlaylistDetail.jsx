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

export default function MyPlaylistDetail() {
  const { id } = useParams();
  const [pl, setPl] = useState(null);
  const { playSong } = usePlayer(); // assume you have a helper to play array
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addingTrackIds, setAddingTrackIds] = useState(new Set());

  const load = async () => {
    const data = await getCustomPlaylistDetail(id);
    setPl(data);
  };

  useEffect(() => { load(); }, [id]);

  if (!pl) return <div className="min-h-screen bg-[#0d0f12] text-white p-4">Loading…</div>;

  const onRemove = async (videoId) => {
    if (!confirm("Remove this track?")) return;
    await removeTrackFromPlaylist(id, videoId);
    await load();
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
  if (addingTrackIds.has(track.video_id)) return;
  setAddingTrackIds(prev => {
    const next = new Set(prev);
    next.add(track.video_id);
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
  alert(`${track.title} added to playlist!`);

  // Update UI: remove this track from search results, reset inputs & loading state
  setSearchResults(prev => prev.filter(tr => tr.video_id !== track.video_id && tr.yt_video_id !== track.video_id));
  setAddingTrackIds(prev => {
    const next = new Set(prev);
    next.delete(track.video_id);
    return next;
  });
  setSearchQuery("");
  setSearchVisible(false);

  // Fetch updated playlist content
  const updated = await getCustomPlaylistDetail(id);
  setPl(updated);
} catch (e) {
  alert("Failed to add track");
}

};

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pb-16">
      <div className="p-4">
        <div className="w-full h-40 bg-gray-700 rounded-lg flex items-center justify-center text-5xl mb-4">
          {pl.is_favourites ? "❤️" : "🎵"}
        </div>
           <div className="flex items-center justify-between">
  <div>
    <h1 className="text-xl font-bold">{pl.name}</h1>
    <div className="text-xs text-gray-400">{pl.tracks.length} Songs</div>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setSearchVisible(!searchVisible)}
      className="px-3 py-1 rounded-lg bg-pink-500 text-white"
      title="Add songs"
    >
      +
    </button>
    <button
      onClick={startPlayback}
      className="px-4 py-2 rounded-lg bg-pink-500"
    >
      Play
    </button>
  </div>
</div>


     {searchVisible && (
  <div className="mt-4 p-3 bg-[#222733] rounded-md">
    <div className="flex gap-2">
      <input
        type="text"
        autoFocus
        placeholder="Search songs to add"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
        className="flex-grow p-2 rounded bg-gray-700 text-white"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-pink-500 rounded hover:bg-pink-600"
      >
        Search
      </button>
    </div>

    <div className="mt-3 max-h-48 overflow-auto">
      {searchResults.length === 0 && <p className="text-gray-400 mt-2">No results</p>}
      {searchResults.map(track => (
        <div key={track.video_id} className="flex justify-between items-center p-2 rounded hover:bg-gray-800">
          <div>
            <div className="text-sm font-semibold">{track.title}</div>
            <div className="text-xs text-gray-400">{track.artist_name || "Unknown Artist"}</div>
          </div>
          <button
            disabled={addingTrackIds.has(track.video_id)}
            onClick={() => handleAddTrack(track)}
            className="text-pink-500 hover:underline"
          >
            {addingTrackIds.has(track.video_id) ? "Adding..." : "Add"}
          </button>
        </div>
      ))}
    </div>
  </div>
)}


        <div className="mt-4 space-y-2">
  {pl.tracks.map((t) => (
    <div
      key={t.video_id}
      className="flex items-center gap-3 bg-[#161a23] p-2 rounded-lg cursor-pointer"
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
      <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden">
        {t.thumbnail_url ? (
          <img src={t.thumbnail_url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{t.title}</div>
        <div className="text-xs text-gray-400 truncate">{t.artist_name}</div>
      </div>
      <button className="text-sm text-red-400" onClick={(e) => { e.stopPropagation(); onRemove(t.video_id); }}>
        Remove
      </button>
    </div>
  ))}
  {pl.tracks.length === 0 && (
    <div className="text-center text-gray-400 mt-8">No songs yet.</div>
  )}
</div>

      </div>
      <BottomNav />
    </div>
  );
}

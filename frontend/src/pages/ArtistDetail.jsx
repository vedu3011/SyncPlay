// frontend/src/pages/ArtistDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArtistDetail } from "../lib/api";
import BottomNav from "../components/BottomNav";
import { usePlayer } from "../contexts/PlayerContext"; 

export default function ArtistDetail() {
  const { id } = useParams(); // browse_id
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    (async () => setData(await getArtistDetail(id)))();
  }, [id]);

  if (!data) return <div className="min-h-screen bg-[#0d0f12] text-white p-4">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pb-16">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => nav(-1)} className="text-xl">←</button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white">S</div>
        </div>

        <div className="mt-3">
          <div className="w-full h-48 rounded-xl overflow-hidden bg-[#222733]">
            {data.image_url && <img src={data.image_url} className="w-full h-full object-cover" />}
          </div>
          <h1 className="text-2xl font-bold mt-3">{data.name}</h1>
          <p className="text-gray-400 text-sm">Top songs</p>
        </div>
        <div className="mt-4 space-y-3">
  {data.songs.map((s, idx) => (
    <div
      key={idx}
      className="flex items-center gap-3 p-2 rounded-xl bg-[#161a23]"
      onClick={() => playSong(s, { type: 'search', songs: data.songs })}
      style={{ cursor: 'pointer' }}  // optional for usability feedback
    >
      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-700">
        {s.thumbnail_url && <img src={s.thumbnail_url} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{s.title}</div>
        <div className="text-xs text-gray-400 truncate">{s.artist_name}</div>
      </div>
      <button className="text-gray-400">⋮</button>
    </div>
  ))}
</div>

      </div>
      <BottomNav />
    </div>
  );
}

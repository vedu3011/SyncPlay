// frontend/src/pages/ArtistDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArtistDetail } from "../lib/api";
import BottomNav from "../components/BottomNav";
import { usePlayer } from "../contexts/PlayerContext"; 
import { IoArrowBackOutline } from "react-icons/io5";

export default function ArtistDetail() {
  const { id } = useParams(); // browse_id
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    (async () => setData(await getArtistDetail(id)))();
  }, [id]);

  if (!data) return <div className="h-screen w-screen bg-[#010101] text-white flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white p-[12px]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-[8px]">
          <button onClick={() => nav(-1)} className="text-xl"><IoArrowBackOutline /></button>
 <div className="flex items-center justify-center">
          <img
          src="../assets/syncplay_logo.png"
          alt="logo"
          className="w-[26px] h-[30px] object-contain flex justify-center relative z-10"
        /></div>
        </div>

        <div className="mb-6 flex flex-col items-center">
          <div className="w-full h-48 rounded-xl overflow-hidden bg-[#222733] mb-4 relative group">
            {data.image_url && <img src={data.image_url} className="w-[280px] h-[280px] object-cover" />}
          </div>
           <div className="flex w-full justify-between items-center gap-[8px] my-[12px]">
          <h1 className="text-[20px] font-[600] font-bold mb-2">{data.name}</h1>
          <p className="text-gray-400 text-sm mb-2">Top songs</p>
          </div>
        </div>
        <div className="flex flex-col gap-[8px] w-full items-center pb-[96px]">
  {data.songs.map((s, idx) => (
    <div
      key={idx}
      className="flex gap-[8px] items-center relative w-full cursor-pointer"
      onClick={() => playSong(s, { type: 'search', songs: data.songs })}
      style={{ cursor: 'pointer' }}  // optional for usability feedback
    >
      <div className="w-[56px] h-[56px] flex-shrink-0">
        {s.thumbnail_url && <img src={s.thumbnail_url} className="w-full h-full object-cover" />}
      </div>
      <div className="w-3/4 shrink-0">
        <div className="text-[14px] font-semibold truncate">{s.title}</div>
        <div className="text-[12px] text-[#777] truncate">{s.artist_name}</div>
      </div>
      <button className="text-gray-400 hidden">⋮</button>
    </div>
  ))}
</div>

      </div>
      <BottomNav />
    </div>
  );
}

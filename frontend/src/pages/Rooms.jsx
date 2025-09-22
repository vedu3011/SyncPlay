import { useEffect, useState } from "react";
import { listMyRooms, searchPublicRooms } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Rooms() {
  const nav = useNavigate();
  const [tab, setTab] = useState("public");
  const [mine, setMine] = useState({ public: [], private: [] });
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => setMine(await listMyRooms()))();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (tab !== "public") return;
      const data = await searchPublicRooms(q);
      setResults(data);
    }, 250);
    return () => clearTimeout(t);
  }, [q, tab]);

  const roomsToShow = tab === "public" ? mine.public : mine.private;

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white p-[12px] mb-[84px]">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-[28px] font-[700]">Rooms</h1>
        <div className="flex">
          <button onClick={() => nav("/rooms/create")} className="px-3 py-2 w-[72px] rounded-l-[80px] bg-[#dd2476] text-[14px]">Create</button>
          <button onClick={() => nav("/rooms/join")} className="px-3 py-2 w-[72px] rounded-r-[80px] text-[#dd2476] bg-[#fff] border-2 text-[14px]">Join</button>
        </div>
      </div>

      <div className="w-full my-[12px] flex justify-evenly">
        <button className={`px-[12px] ${tab === "public" ? "border-b-2" : ""}`} onClick={() => setTab("public")}>Public</button>
        <button className={`px-[12px] ${tab === "private" ? "border-b-2" : ""}`} onClick={() => setTab("private")}>Private</button>
      </div>

      {tab === "public" && (
        <div className="w-full px-[8px] py-[4px] mb-[8px] border border-bg-[#555] bg-[#101010] flex justify-between items-center rounded-[12px]">
          <input className="text-white bg-transparent outline-none flex-1w-full p-2 rounded" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search public rooms..." />
        </div>
      )}

      <div className="px-4 space-y-2 mb-[12px]">
        {roomsToShow.length === 0 && (
          <div className="text-gray-400 py-10 mb-[16px] text-center">
            You haven't joined any {tab} rooms yet.
          </div>
        )}
        {roomsToShow.map(r => (
          <div key={r.id} onClick={() => nav(`/rooms/${r.id}`)} className="p-[4px] rounded hover:bg-[#151924] border-b border-[#777] cursor-pointer mb-[8px]">
            <div className="font-semibold">{r.name}</div>
            <div className="text-[12px] text-[#fff]">{r.is_private ? "Private" : "Public"} • {r.members_count} members</div>
          </div>
        ))}
      </div>

      {tab === "public" && results.length > 0 && (
        <>
          <div className="mt-[16px] font-[600] text-[18px]">Explore Public Rooms</div>
          <div className="px-4 space-y-2 mt-1">
            {results.map(r => (
              <div key={r.id} onClick={() => nav(`/rooms/${r.id}`)} className="p-[4px] rounded hover:bg-[#151924] border-b border-[#777] cursor-pointer">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-gray-400">Public • {r.members_count} members</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

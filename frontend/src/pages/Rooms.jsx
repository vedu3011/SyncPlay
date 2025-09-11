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
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rooms</h1>
        <div className="flex gap-2">
          <button onClick={() => nav("/rooms/create")} className="px-3 py-2 bg-pink-500 rounded">Create</button>
          <button onClick={() => nav("/rooms/join")} className="px-3 py-2 bg-gray-700 rounded">Join</button>
        </div>
      </div>

      <div className="px-4 mb-2 flex gap-4">
        <button className={tab==='public'?'text-pink-400':''} onClick={() => setTab("public")}>Public</button>
        <button className={tab==='private'?'text-pink-400':''} onClick={() => setTab("private")}>Private</button>
      </div>

      {tab === "public" && (
        <div className="px-4 mb-3">
          <input className="w-full p-2 rounded bg-[#161a23]" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search public rooms..." />
        </div>
      )}

      <div className="px-4 space-y-2">
        {roomsToShow.length === 0 && (
          <div className="text-gray-400 py-10 text-center">
            You haven't joined any {tab} rooms yet.
          </div>
        )}
        {roomsToShow.map(r => (
          <div key={r.id} onClick={() => nav(`/rooms/${r.id}`)} className="p-3 bg-[#111216] rounded hover:bg-[#151924] cursor-pointer">
            <div className="font-semibold">{r.name}</div>
            <div className="text-xs text-gray-400">{r.is_private ? "Private" : "Public"} • {r.members_count} members</div>
          </div>
        ))}
      </div>

      {tab === "public" && results.length > 0 && (
        <>
          <div className="px-4 mt-6 text-sm text-gray-400">Explore Public</div>
          <div className="px-4 space-y-2 mt-1">
            {results.map(r => (
              <div key={r.id} onClick={() => nav(`/rooms/${r.id}`)} className="p-3 bg-[#111216] rounded hover:bg-[#151924] cursor-pointer">
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

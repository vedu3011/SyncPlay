import { useState } from "react";
import { joinRoomByCode } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const nav = useNavigate();
  const [code, setCode] = useState("");

  const join = async () => {
    const r = await joinRoomByCode(code);
    nav(`/rooms/${r.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white p-4">
      <h1 className="text-xl font-semibold mb-4">Join via Invite Code</h1>
      <input className="w-full p-3 bg-[#161a23] rounded mb-4" placeholder="Enter code (e.g. 4FJ2ZQ)" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} />
      <button className="px-4 py-2 bg-pink-500 rounded" onClick={join}>Join</button>
    </div>
  );
}

import { useState } from "react";
import { createRoom } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const submit = async () => {
    const r = await createRoom({ name, is_private: isPrivate });
    nav(`/rooms/${r.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white p-4">
      <h1 className="text-xl font-semibold mb-4">Create Room</h1>
      <input className="w-full p-3 bg-[#161a23] rounded mb-3" placeholder="Room name" value={name} onChange={e=>setName(e.target.value)} />
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} /> Private Room
      </label>
      <button className="px-4 py-2 bg-pink-500 rounded" onClick={submit}>Create</button>
    </div>
  );
}

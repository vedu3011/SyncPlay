import { useState } from "react";
import { createRoom } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";

export default function CreateRoom() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const submit = async () => {
    const r = await createRoom({ name, is_private: isPrivate });
    nav(`/rooms/${r.id}`);
  };

  return (
    <div className="h-screen w-screen bg-[#010101] flex flex-col justify-center items-center gap-[20px] mt-[-64px] relative">
            {/* Header */}
        <div className="absolute top-[80px] left-[16px]">
          <button 
            onClick={() => window.history.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <IoArrowBackOutline />
          </button>
        </div>
      <h1 className="text-xl font-semibold mb-4">Create Room</h1>
      
      <input className="w-1/2 p-3 bg-transparent border-b border-gray-600 text-white focus:outline-none transition-colors"
      style={{
            borderBottomColor: name ? '#ec4899' : '#4b5563' // Pink when typing, gray when empty
          }}
      placeholder="Room name" value={name} onChange={e=>setName(e.target.value)} />
      <div className=" flex w-1/2 justify-between items-center">
      <label className="flex items-center gap-[2px] text-[12px] mb-4">
        <input type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} /> Private Room
      </label>
      
      <button className="px-3 py-1 rounded text-[#dd2476] hover:bg-pink-600 text-white" onClick={submit}>Create</button>
      </div>
    </div>
  );
}

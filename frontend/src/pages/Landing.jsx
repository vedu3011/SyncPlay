// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col justify-between px-6 py-10">
      <div className="mt-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center text-2xl font-bold">
          S
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold">Jam. Chat. Repeat.</h1>
        <p className="text-gray-300 max-w-xs">
          Sync music across devices, drop songs in the queue, and vibe with your crew.
        </p>
      </div>

      <button
        onClick={() => nav("/signup")}
        className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400"
      >
        Get Started
      </button>
    </div>
  );
}

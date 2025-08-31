// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    // <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col justify-between px-6 py-10">
      <div className="min-h-screen w-screen bg-[#010101] h-[400px] text-white flex flex-col justify-between items-center px-6 py-10 relative overflow-hidden">

      {/* Background Spiral Image */}
      <img
        src="../assets/bg_img.png" // put your spiral image here
        alt="background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Logo */}
      <div className="flex justify-center items-center flex-1 relative z-10">
        <img
          src="../assets/syncplay_logo.png"
          alt="logo"
          className="w-[144px] h-[162px] object-contain"
        />
      </div>
      

      <div className="z-10 w-[256px]">
        <h1 className="text-[26px] text-center font-extrabold">Jam. Chat. Repeat.</h1>
        <p className="text-white text-center mx-[80]">
          Sync music across devices, drop songs in the queue, and vibe with your crew.
        </p>
      </div>

      <button
        onClick={() => nav("/signup")}
        className="w-[256px] rounded-2xl text-lg font-semibold text-white z-10">
        <div>Get Started</div>
      </button>
    </div>
  );
}

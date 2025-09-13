import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getGenres, savePreferences } from "../lib/api";

export default function SelectGenres() {
  const nav = useNavigate();
  const { state } = useLocation();
  const artist_ids = state?.artist_ids || [];
  const username = localStorage.getItem("username");


  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev; // cap if needed
      return [...prev, id];
    });
  };

  const submit = async () => {
    try {
      await savePreferences({ artist_ids, genre_ids: selected });
      nav("/home"); // or dashboard
    } catch (e) {
      console.error(e);
      alert("Could not save preferences");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white px-6 py-10 flex flex-col items-center gap-[8px] overflow-hidden relative">
      
      <div className="flex gap-[96px] items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          <h4>Welcome back!</h4> 
          <p>{username ? `${username}` : ""}</p>
        </div>
        <div className="flex items-center justify-center">
          <img
          src="../assets/syncplay_logo.png"
          alt="logo"
          className="w-[26px] h-[30px] object-contain flex justify-center relative z-10"
        /></div>
      </div>

      <h1 className="text-[26px] font-extrabold">Set Your Preferences</h1>
      <p className="text-gray-400 mb-4">Select your 5 favorites</p>

      <div className="grid grid-cols-2 gap-[20px] overflow-y-auto">
        {genres.map((g, idx) => {
          const active = selected.includes(g.id);
          const colors = ["border-l-[#FF7777]", // red
          "border-l-[#FFFA77]", // yellow  
          "border-l-[#77FF95]"  // green
          ];
          const color = colors[idx % 3]; 
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`relative flex items-center h-16 py-[8px] transition-all duration-200 border-l-[8px] ${color} rounded-xl overflow-hidden
              ${active 
                ? "bg-[#1D2729] shadow-md shadow-pink-500/30" : "bg-[#0E1516]"
              }`}
              style={{ 
              borderTopRightRadius: '0.75rem', 
              borderBottomRightRadius: '0.75rem',
              borderTopLeftRadius: '0.75rem',
              borderBottomLeftRadius: '0.75rem'
              }}
            >
              {/* <span className={`w-2 h-full rounded-l-md ${color}`} /> */}
              <span className="w-full ml-3 text-xs text-center text-white">{g.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={submit}
          disabled={artist_ids.length === 0}
          className="button-style w-full py-3 rounded-xl text-lg font-semibold"
        >
          Ready to GOOO....
        </button>
      </div>
    </div>
  );
}

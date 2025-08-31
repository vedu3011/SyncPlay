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
      if (prev.length >= 10) return prev; // cap if needed
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
    <div className="min-h-screen bg-[#0d0f12] text-white px-6 py-8 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">Welcome back! {username ? `, ${username}` : ""}</div>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white">S</div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Set Your Preferences</h1>
      <p className="text-gray-400 mb-4">Select your favorites</p>

      <div className="space-y-3 overflow-y-auto">
        {genres.map((g, idx) => {
          const active = selected.includes(g.id);
          const color = ["bg-pink-500","bg-yellow-400","bg-green-500","bg-blue-500"][idx % 4];
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border border-gray-700
                ${active ? "bg-gray-800 ring-2 ring-pink-500" : "bg-transparent"}`}
            >
              <span className={`w-2 h-6 rounded ${color}`} />
              <span className="text-sm">{g.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={submit}
          disabled={artist_ids.length === 0}
          className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
        >
          Ready to GOOO....
        </button>
      </div>
    </div>
  );
}

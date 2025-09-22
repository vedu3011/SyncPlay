import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getArtists } from "../lib/api";

export default function SelectArtists() {
  const nav = useNavigate();
  const [artists, setArtists] = useState([]);
  const [selected, setSelected] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    (async () => {
      try {
        const data = await getArtists();
        setArtists(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev; // max 5
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white px-6 py-10 overflow-hidden relative">
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

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4 mt-2">
        {artists.map((a) => {
          const active = selected.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`flex flex-col items-center focus:outline-none mb-[8px]`}
            >
              <div
                className={`w-[64px] h-[64px] rounded-full overflow-hidden
                ${active ? "gradient-border" : ""}`}
              >
                <img
                  src={a.image_url || "/placeholder-artist.png"}
                  alt={a.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-1 text-[11px] text-center line-clamp-2">{a.name}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={() => nav("/genres", { state: { artist_ids: selected } })}
          disabled={selected.length === 0}
          className="button-style w-full py-3 rounded-xl text-lg font-semibold"
        >
          Proceed
        </button>
        <div className="text-center text-xs text-gray-400 mt-2">
          {selected.length}/5 selected
        </div>
      </div>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getArtists } from "../lib/api";

// export default function SelectArtists() {
//   const nav = useNavigate();
//   const [artists, setArtists] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const username = localStorage.getItem("username");

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getArtists();
//         setArtists(data);
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, []);

//   const toggle = (id) => {
//     setSelected((prev) => {
//       const exists = prev.includes(id);
//       if (exists) return prev.filter((x) => x !== id);
//       if (prev.length >= 5) return prev; // max 5
//       return [...prev, id];
//     });
//   };

//   return (
//     <div className="min-h-screen bg-[#0d0f12] text-white px-6 py-8 flex flex-col">
//       <div className="flex items-center justify-between mb-6">
//         <div className="text-sm text-gray-400">Welcome back! {username ? `, ${username}` : ""}</div>
//         <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white">S</div>
//       </div>

//       <h1 className="text-2xl font-bold mb-2">Set Your Preferences</h1>
//       <p className="text-gray-400 mb-4">Select your 5 favorites</p>

//       {/* Grid */}
//       <div className="grid grid-cols-4 gap-4 mt-2">
//         {artists.map((a) => {
//           const active = selected.includes(a.id);
//           return (
//             <button
//               key={a.id}
//               onClick={() => toggle(a.id)}
//               className={`flex flex-col items-center focus:outline-none`}
//             >
//               <div
//                 className={`w-16 h-16 rounded-full border-2 overflow-hidden 
//                 ${active ? "border-pink-500" : "border-transparent"}`}
//               >
//                 <img
//                   src={a.image_url || "/placeholder-artist.png"}
//                   alt={a.name}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="mt-1 text-[11px] text-center line-clamp-2">{a.name}</div>
//             </button>
//           );
//         })}
//       </div>

//       <div className="mt-auto pt-6">
//         <button
//           onClick={() => nav("/genres", { state: { artist_ids: selected } })}
//           disabled={selected.length === 0}
//           className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
//         >
//           Proceed
//         </button>
//         <div className="text-center text-xs text-gray-400 mt-2">
//           {selected.length}/5 selected
//         </div>
//       </div>
//     </div>
//   );
// }

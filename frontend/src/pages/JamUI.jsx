// // src/pages/JamUI.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { usePlayer } from "../contexts/PlayerContext";
// import { getSearchResults } from "../lib/api";
// import useUnifiedSocket from "../hooks/useUnifiedSocket";

// export default function JamUI({ roomId, onClose }) {
//   const [participants, setParticipants] = useState([]);
//   const [queue, setQueue] = useState([]);
//   const [current, setCurrent] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [loadingSearch, setLoadingSearch] = useState(false);
//   const { playSong, setIsPlaying: setPlayerPlaying, seekTo, currentSong } = usePlayer();

//   // Use unified socket for jam functionality only
//   const { connected, send, lastMessage } = useUnifiedSocket(roomId, null);

//   // Handle WebSocket messages from the hook
//   useEffect(() => {
//     if (!lastMessage) return;

//     const data = lastMessage;
//     console.log("[JamUI] Processing message:", data);

//     if (data.type === "jam_state") {
//       setCurrent({
//         video_id: data.current_track_id,
//         title: data.current_track_title,
//         artist_name: data.current_track_artist,
//         position: data.current_position
//       });
//       setIsPlaying(!!data.is_playing);
//       setQueue(data.queue || []);
//     } else if (data.type === "jam_control") {
//       // The hook already handles jam_control in the player context
//       // Just update local UI state
//       if (data.action === "play") {
//         setIsPlaying(true);
//       } else if (data.action === "pause") {
//         setIsPlaying(false);
//       }
//     } else if (data.type === "queue_updated") {
//       if (data.action === "track_added") {
//         setQueue(prev => [...prev, data.track]);
//       } else if (data.action === "track_removed") {
//         setQueue(prev => prev.filter(q => q.video_id !== data.video_id));
//       }
//     } else if (data.type === "user_joined") {
//       setParticipants(prev => [...prev.filter(p => p.user_id !== data.user_id), { user_id: data.user_id, user: data.user }]);
//     } else if (data.type === "user_left") {
//       setParticipants(prev => prev.filter(p => p.user_id !== data.user_id));
//     }
//   }, [lastMessage]);

//   // local control handlers
//   const handlePlay = () => {
//     if (!current) return;
//     console.log("[JamUI] Sending play command");
//     send({
//       type: "play",
//       track_id: current.video_id,
//       track_title: current.title,
//       track_artist: current.artist_name,
//       position: 0
//     });
//   };

//   const handlePause = () => {
//     console.log("[JamUI] Sending pause command");
//     send({ type: "pause", position: currentSong?.currentTime || 0 });
//   };

//   const handleSeek = (posSec) => {
//     console.log("[JamUI] Sending seek command to:", posSec);
//     send({ type: "seek", position: posSec });
//   };

//   const addToQueue = (track) => {
//     console.log("[JamUI] Adding track to queue:", track.title);
//     send({
//       type: "add_to_queue",
//       video_id: track.yt_video_id || track.videoId,
//       title: track.title,
//       artist_name: track.artist_name,
//       thumbnail_url: track.thumbnail_url || track.thumbnail,
//       duration_sec: track.duration_sec || track.durationSeconds
//     });
//   };

//   const sendPlayThenAdd = (track) => {
//     console.log("[JamUI] Starting jam with track:", track.title);
//     // ensure queue add then play
//     addToQueue(track);
//     setTimeout(() => {
//       send({
//         type: "play",
//         track_id: track.yt_video_id || track.videoId,
//         track_title: track.title,
//         track_artist: track.artist_name,
//         position: 0
//       });
//     }, 250);
//   };

//   // search
//   useEffect(() => {
//     const t = setTimeout(async () => {
//       if (searchQuery.trim().length < 2) {
//         setSearchResults([]); return;
//       }
//       setLoadingSearch(true);
//       try {
//         const res = await getSearchResults(searchQuery, 12);
//         // depends on your API shape; adjust
//         // assume res.tracks or res.items
//         const items = res.songs || res || [];
//         setSearchResults(items);
//       } catch (err) {
//         setSearchResults([]);
//       } finally {
//         setLoadingSearch(false);
//       }
//     }, 300);
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   return (
//     <div className="fixed inset-0 z-50 bg-black/80 text-white p-4 overflow-auto">
//       <div className="max-w-3xl mx-auto bg-[#0d0f12] rounded-lg p-4">
//         <div className="flex items-center justify-between mb-3">
//           <div>
//             <div className="text-lg font-semibold">Jam Session</div>
//             <div className="text-xs text-gray-400">
//               {connected ? "Connected" : "Disconnected"} • {participants.length + 1} participant(s)
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setSearchQuery("")} className="px-3 py-1 bg-gray-700 rounded">Clear</button>
//             <button onClick={() => { if (onClose) onClose(); }} className="px-3 py-1 bg-red-600 rounded">Close</button>
//           </div>
//         </div>

//         <div className="mb-4">
//           <div className="flex gap-3 items-center">
//             <div className="flex-1">
//               <div className="text-sm text-gray-300 mb-1">Now Playing</div>
//               <div className="bg-[#161a23] p-3 rounded">
//                 <div className="font-semibold">{current?.title || "—"}</div>
//                 <div className="text-xs text-gray-400">{current?.artist_name || ""}</div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={handlePlay} 
//                 disabled={!connected}
//                 className="px-3 py-2 bg-green-500 rounded disabled:bg-gray-600"
//               >
//                 Play
//               </button>
//               <button 
//                 onClick={handlePause} 
//                 disabled={!connected}
//                 className="px-3 py-2 bg-yellow-500 rounded disabled:bg-gray-600"
//               >
//                 Pause
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="mb-4">
//           <div className="text-sm text-gray-300 mb-2">Queue</div>
//           <div className="space-y-2">
//             {queue.map((q, idx) => (
//               <div key={q.video_id || idx} className="flex items-center gap-3 bg-[#111216] p-2 rounded">
//                 <img 
//                   src={q.thumbnail_url} 
//                   className="w-12 h-12 object-cover rounded" 
//                   alt=""
//                   onError={(e) => e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxNi4yNjggMzIgMTAgMjUuNzMyIDEwIDE4UzE2LjI2OCA0IDI0IDRTMzggMTAuMjY4IDM4IDE4UzMxLjczMiAzMiAyNCAzMlpNMjQgMjhDMjkuNTI0IDI4IDM0IDIzLjUyNCAzNCAxOFMyOS41MjQgOCAyNCA4UzE0IDEyLjQ3NiAxNCAxOFMxOC40NzYgMjggMjQgMjhaIiBmaWxsPSIjNzc3Ii8+Cjwvc3ZnPgo="} 
//                 />
//                 <div className="flex-1">
//                   <div className="font-semibold text-sm">{q.title}</div>
//                   <div className="text-xs text-gray-400">{q.artist_name}</div>
//                 </div>
//                 <div className="text-xs text-gray-400">
//                   {q.duration_sec ? `${Math.floor(q.duration_sec/60)}:${String(q.duration_sec%60).padStart(2,"0")}` : ""}
//                 </div>
//               </div>
//             ))}
//             {queue.length === 0 && <div className="text-gray-400 text-sm">No tracks in queue yet.</div>}
//           </div>
//         </div>

//         <div className="mb-4">
//           <div className="text-sm text-gray-300 mb-2">Search & Add</div>
//           <div className="flex gap-2">
//             <input 
//               value={searchQuery} 
//               onChange={e => setSearchQuery(e.target.value)} 
//               placeholder="Search tracks..." 
//               className="flex-1 p-2 rounded bg-[#0f1317] text-white" 
//             />
//             <button 
//               className="px-3 py-2 bg-pink-500 rounded hover:bg-pink-600 transition" 
//               onClick={() => setSearchQuery("")}
//             >
//               Clear
//             </button>
//           </div>
//           <div className="mt-3 space-y-2 max-h-64 overflow-auto">
//             {loadingSearch ? <div className="text-gray-400">Searching…</div> : null}
//             {searchResults.map((t, i) => {
//               const videoId = t.yt_video_id || t.videoId || t.video_id;
//               return (
//                 <div key={videoId || i} className="flex items-center gap-3 bg-[#111216] p-2 rounded hover:bg-[#151924] transition">
//                   <img 
//                     src={t.thumbnail_url || t.thumbnail} 
//                     className="w-14 h-14 object-cover rounded" 
//                     alt=""
//                     onError={(e) => e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxNi4yNjggMzIgMTAgMjUuNzMyIDEwIDE4UzE2LjI2OCA0IDI0IDRTMzggMTAuMjY4IDM4IDE4UzMxLjczMiAzMiAyNCAzMlpNMjQgMjhDMjkuNTI0IDI4IDM0IDIzLjUyNCAzNCAxOFMyOS41MjQgOCAyNCA4UzE0IDEyLjQ3NiAxNCAxOFMxOC40NzYgMjggMjQgMjhaIiBmaWxsPSIjNzc3Ii8+Cjwvc3ZnPgo="}
//                   />
//                   <div className="flex-1">
//                     <div className="font-semibold text-sm">{t.title}</div>
//                     <div className="text-xs text-gray-400">{t.artist_name}</div>
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     <button 
//                       onClick={() => addToQueue(t)} 
//                       disabled={!connected}
//                       className="px-2 py-1 bg-green-500 rounded text-xs hover:bg-green-600 disabled:bg-gray-600 transition"
//                     >
//                       Add to Queue
//                     </button>
//                     <button 
//                       onClick={() => sendPlayThenAdd(t)} 
//                       disabled={!connected}
//                       className="px-2 py-1 bg-pink-500 rounded text-xs hover:bg-pink-600 disabled:bg-gray-600 transition"
//                     >
//                       Start Jam
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {!connected && (
//           <div className="bg-red-900/50 border border-red-500 rounded p-3 text-center">
//             <div className="text-red-400 font-medium">Disconnected from Jam Session</div>
//             <div className="text-red-300 text-sm">Trying to reconnect...</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// src/components/JamUI.jsx
import React, { useEffect, useState } from "react";
import { getSearchResults } from "../lib/api";

export default function JamUI({ 
  connected, 
  send, 
  lastMessage, 
  isOpen, 
  onClose ,
   friendshipId
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Handle WebSocket messages for jam updates
  useEffect(() => {
    if (!lastMessage) return;

    const data = lastMessage;
    
    if (data.type === "jam_state") {
      setCurrentTrack({
        video_id: data.current_track_id,
        title: data.current_track_title,
        artist_name: data.current_track_artist,
        position: data.current_position
      });
      setQueue(data.queue || []);
    } else if (data.type === "queue_updated") {
      if (data.action === "track_added") {
        setQueue(prev => [...prev, data.track]);
      } else if (data.action === "track_removed") {
        setQueue(prev => prev.filter(q => q.video_id !== data.video_id));
      } else if (data.action === "queue_reordered") {
        setQueue(data.queue || []);
      }
    }
  }, [lastMessage]);

  // Search functionality with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await getSearchResults(searchQuery, 10);
        const tracks = res.songs || res.tracks || res || [];
        setSearchResults(tracks);
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToQueue = (track, playImmediately = false) => {
    if (!connected) {
      alert("Not connected to jam session");
      return;
    }

    console.log(`[JamDropdown] ${playImmediately ? 'Playing' : 'Adding'} track:`, track.title);
    
    const message = {
      type: playImmediately ? "play_now" : "add_to_queue",
      video_id: track.yt_video_id || track.videoId || track.video_id,
      title: track.title,
      artist_name: track.artist_name || track.artist,
      thumbnail_url: track.thumbnail_url || track.thumbnail,
      duration_sec: track.duration_sec || track.durationSeconds || 0,
      position: playImmediately ? 0 : undefined
    };

    send(message);

    // Clear search after adding
    if (playImmediately || queue.length === 0) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const playFromQueue = (track) => {
    if (!connected) {
      alert("Not connected to jam session");
      return;
    }

    console.log("[JamDropdown] Playing from queue:", track.title);
    send({
      type: "play",
      track_id: track.video_id,
      track_title: track.title,
      track_artist: track.artist_name,
      position: 0
    });
  };

  const removeFromQueue = (videoId) => {
    if (!connected) return;
    
    console.log("[JamDropdown] Removing from queue:", videoId);
    send({
      type: "remove_from_queue",
      video_id: videoId
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-[#0d0f12] border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="font-medium text-white">Jam Session</span>
          <span className="text-xs text-gray-400">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs to add to jam..."
            className="w-full p-3 pr-10 rounded-lg bg-[#161a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {/* Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Search Results</h3>
            {loadingSearch ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-gray-400 text-sm">Searching...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((track, index) => {
                  const videoId = track.yt_video_id || track.videoId || track.video_id || index;
                  return (
                    <div
                      key={videoId}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#111216] hover:bg-[#151924] transition"
                    >
                      <img
                        src={track.thumbnail_url || track.thumbnail}
                        className="w-12 h-12 object-cover rounded"
                        alt=""
                        onError={(e) => e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxNi4yNjggMzIgMTAgMjUuNzMyIDEwIDE4UzE2LjI2OCA0IDI0IDRTMzggMTAuMjY4IDM4IDE4UzMxLjczMiAzMiAyNCAzMlpNMjQgMjhDMjkuNTI0IDI4IDM0IDIzLjUyNCAzNCAxOFMyOS41MjQgOCAyNCA4UzE0IDEyLjQ3NiAxNCAxOFMxOC40NzYgMjggMjQgMjhaIiBmaWxsPSIjNzc3Ii8+Cjwvc3ZnPgo="}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate">
                          {track.title}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {track.artist_name || track.artist || "Unknown Artist"}
                        </div>
                        {track.duration_sec > 0 && (
                          <div className="text-xs text-gray-500">
                            {Math.floor(track.duration_sec / 60)}:{String(track.duration_sec % 60).padStart(2, "0")}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => addToQueue(track, true)}
                          disabled={!connected}
                          className="px-3 py-1 bg-pink-600 rounded text-xs hover:bg-pink-700 disabled:bg-gray-600 transition font-medium"
                        >
                          Play Now
                        </button>
                        <button
                          onClick={() => addToQueue(track, false)}
                          disabled={!connected}
                          className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700 disabled:bg-gray-600 transition"
                        >
                          Add to Queue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery.trim().length >= 2 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Current Playing */}
        {currentTrack && (
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Now Playing</h3>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-green-900/20 border border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-white truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {currentTrack.artist_name || "Unknown Artist"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue */}
        {queue.length > 0 && (
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Up Next ({queue.length} songs)
            </h3>
            <div className="space-y-2">
              {queue.map((track, index) => (
                <div
                  key={track.video_id || index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[#111216] hover:bg-[#151924] transition group"
                >
                  <div className="text-xs text-gray-500 w-6 text-center">
                    {index + 1}
                  </div>
                  <img
                    src={track.thumbnail_url}
                    className="w-10 h-10 object-cover rounded"
                    alt=""
                    onError={(e) => e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxNi4yNjggMzIgMTAgMjUuNzMyIDEwIDE4UzE2LjI2OCA0IDI0IDRTMzggMTAuMjY4IDM4IDE4UzMxLjczMiAzMiAyNCAzMlpNMjQgMjhDMjkuNTI0IDI4IDM0IDIzLjUyNCAzNCAxOFMyOS41MjQgOCAyNCA4UzE0IDEyLjQ3NiAxNCAxOFMxOC40NzYgMjggMjQgMjhaIiBmaWxsPSIjNzc3Ci8+Cjwvc3ZnPgo="}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate">
                      {track.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {track.artist_name || "Unknown Artist"}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => playFromQueue(track)}
                      disabled={!connected}
                      className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700 disabled:bg-gray-600 transition"
                      title="Play this song now"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => removeFromQueue(track.video_id)}
                      disabled={!connected}
                      className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700 disabled:bg-gray-600 transition"
                      title="Remove from queue"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {queue.length === 0 && !currentTrack && searchQuery.trim().length < 2 && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">🎵</div>
            <div className="text-lg font-medium mb-2">Start a Jam Session</div>
            <div className="text-sm">
              Search for songs above to start playing music together
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-[#0a0c0f]">
        <div className="text-xs text-gray-500 text-center">
          {connected ? (
            "Both participants can search, add songs, and control playback"
          ) : (
            "Reconnecting to jam session..."
          )}
        </div>
      </div>
    </div>
  );
}
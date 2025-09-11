// import { useEffect, useState } from "react";
// import { getRoomDetail, addSuggestion, approveSuggestion, addToRoomQueue, removeFromRoomQueue, saveRoomQueueAsPersonal } from "../lib/api";
// import { getSearchResults } from "../lib/api";
// import useRoomSocket from "../hooks/useRoomSocket";
// import { useParams } from "react-router-dom";
// import { usePlayer } from "../contexts/PlayerContext";

// export default function RoomView() {
//   const { roomId } = useParams();
//   const [room, setRoom] = useState(null);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const { connected, send, onMessage } = useRoomSocket(roomId);
//   const { playTrack, pauseTrack, seekTo, currentSong } = usePlayer();

//   useEffect(() => {
//     (async () => setRoom(await getRoomDetail(roomId)))();
//   }, [roomId]);

//   useEffect(() => {
//     const t = setTimeout(async () => {
//       if (search.trim().length < 2) { setResults([]); return; }
//       const r = await getSearchResults(search, 10);
//       const items = r.songs || r.tracks || r || [];
//       setResults(items);
//     }, 300);
//     return () => clearTimeout(t);
//   }, [search]);

//   useEffect(() => {
//     onMessage((data) => {
//       if (data.type === "play") {
//         const latencyMs = Date.now() - (data.server_timestamp || Date.now());
//         const adjusted = (data.position || 0) + latencyMs / 1000;
//         playTrack({ video_id: data.track_id, title: data.track_title, artist_name: data.track_artist });
//         setTimeout(() => seekTo(adjusted), 150);
//       } else if (data.type === "pause") {
//         pauseTrack();
//       } else if (data.type === "seek") {
//         seekTo(data.position || 0);
//       }
//     });
//   }, []);

//   const canControl = () => {
//     if (!room) return false;
//     const me = room.members.find(m => m.user.id === getMe());
//     return me && (me.role === "host" || me.role === "editor");
//   };
//   const getMe = () => {
//     const tok = localStorage.getItem("access_token");
//     try { return JSON.parse(atob(tok.split(".")[1])).user_id; } catch { return null; }
//   };

//   const submitSuggestion = async (track) => {
//     await addSuggestion(roomId, {
//       yt_video_id: track.yt_video_id || track.videoId || track.video_id,
//       title: track.title,
//       artist_name: track.artist_name || track.artist,
//       thumbnail_url: track.thumbnail_url || track.thumbnail,
//       duration_sec: track.duration_sec || track.durationSeconds || 0
//     });
//     setRoom(await getRoomDetail(roomId));
//   };

//   const approve = async (sid) => {
//     await approveSuggestion(roomId, sid);
//     setRoom(await getRoomDetail(roomId));
//   };

//   const sendPlay = (t) => {
//     send({
//       type: "play",
//       track_id: t.yt_video_id,
//       track_title: t.title,
//       track_artist: t.artist_name,
//       position: 0
//     });
//   };

//   if (!room) return <div className="min-h-screen bg-[#0d0f12] text-white p-4">Loading…</div>;

//   return (
//     <div className="min-h-screen bg-[#0d0f12] text-white p-4">
//       <div className="flex items-center justify-between mb-3">
//         <div>
//           <div className="text-xl font-semibold">{room.name}</div>
//           <div className="text-xs text-gray-400">{room.is_private ? "Private" : "Public"} • Code: {room.join_code}</div>
//         </div>
//         <div className="flex gap-2">
//           <button className="px-3 py-2 bg-gray-700 rounded" onClick={async()=> {
//             const r = await saveRoomQueueAsPersonal(room.id);
//             alert(`Saved as personal playlist: ${r.name}`);
//           }}>Save as Personal</button>
//         </div>
//       </div>

//       <div className="mb-4 flex items-center gap-2">
//         <input className="flex-1 p-2 bg-[#161a23] rounded" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search to suggest…" />
//       </div>

//       {results.length > 0 && (
//         <div className="mb-6 space-y-2 max-h-60 overflow-auto">
//           {results.map((t, i) => {
//             const vid = t.yt_video_id || t.videoId || t.video_id || i;
//             return (
//               <div key={vid} className="flex items-center gap-3 bg-[#111216] p-2 rounded">
//                 <img src={t.thumbnail_url || t.thumbnail} className="w-12 h-12 rounded" />
//                 <div className="flex-1">
//                   <div className="text-sm font-semibold">{t.title}</div>
//                   <div className="text-xs text-gray-400">{t.artist_name || t.artist}</div>
//                 </div>
//                 <button className="px-3 py-1 bg-green-500 rounded text-sm" onClick={() => submitSuggestion(t)}>Suggest</button>
//                 {canControl() && (
//                   <button className="px-3 py-1 bg-pink-500 rounded text-sm" onClick={() => {
//                     addToRoomQueue(roomId, {
//                       yt_video_id: t.yt_video_id || t.videoId || t.video_id,
//                       title: t.title, artist_name: t.artist_name || t.artist,
//                       thumbnail_url: t.thumbnail_url || t.thumbnail,
//                       duration_sec: t.duration_sec || t.durationSeconds || 0
//                     });
//                     setTimeout(() => sendPlay({
//                       yt_video_id: t.yt_video_id || t.videoId || t.video_id,
//                       title: t.title, artist_name: t.artist_name || t.artist
//                     }), 200);
//                   }}>Start Jam</button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <section className="mb-6">
//         <div className="text-sm text-gray-300 mb-2">Queue</div>
//         <div className="space-y-2">
//           {room.queue.map(q => (
//             <div key={q.id} className="flex items-center gap-3 bg-[#111216] p-2 rounded">
//               <img src={q.thumbnail_url} className="w-12 h-12 rounded" />
//               <div className="flex-1">
//                 <div className="text-sm font-semibold">{q.title}</div>
//                 <div className="text-xs text-gray-400">{q.artist_name}</div>
//               </div>
//               {canControl() && (
//                 <>
//                   <button className="px-3 py-1 bg-green-600 rounded text-sm" onClick={() => sendPlay(q)}>Play</button>
//                   <button className="px-3 py-1 bg-red-600 rounded text-sm" onClick={async ()=> {
//                     await removeFromRoomQueue(roomId, q.yt_video_id);
//                     setRoom(await getRoomDetail(roomId));
//                   }}>Remove</button>
//                 </>
//               )}
//             </div>
//           ))}
//           {room.queue.length === 0 && <div className="text-gray-400 text-sm">No tracks in queue.</div>}
//         </div>
//       </section>

//       <section>
//         <div className="text-sm text-gray-300 mb-2">Suggestions</div>
//         <div className="space-y-2">
//           {room.suggestions.map(s => (
//             <div key={s.id} className="flex items-center gap-3 bg-[#111216] p-2 rounded">
//               <img src={s.thumbnail_url} className="w-12 h-12 rounded" />
//               <div className="flex-1">
//                 <div className="text-sm font-semibold">{s.title}</div>
//                 <div className="text-xs text-gray-400">{s.artist_name}</div>
//               </div>
//               {canControl() && (
//                 <button className="px-3 py-1 bg-blue-600 rounded text-sm" onClick={() => approve(s.id)}>Approve</button>
//               )}
//             </div>
//           ))}
//           {room.suggestions.length === 0 && <div className="text-gray-400 text-sm">No suggestions yet.</div>}
//         </div>
//       </section>
//       <div className="mt-6">
//   <div className="text-sm text-gray-300 mb-2">Members</div>
//   <div className="space-y-2">
//     {room.members.map(m => (
//       <div key={m.user.id} className="flex items-center justify-between bg-[#111216] p-2 rounded">
//         <div>
//           <span className="font-semibold">{m.user.username}</span>
//           <span className="ml-2 text-xs text-gray-400">({m.role})</span>
//         </div>
//         {(() => {
//           const me = room.members.find(mm => mm.user.id === getMe());
//           if (me?.role === "host" && m.role !== "host") {
//             return (
//               <div className="flex gap-2">
//                 {m.role === "member" && (
//                   <button className="px-3 py-1 bg-blue-600 rounded text-sm"
//                     onClick={async () => {
//                       await promoteToEditor(room.id, m.user.id);
//                       setRoom(await getRoomDetail(roomId));
//                     }}>Promote</button>
//                 )}
//                 <button
//                     className="px-3 py-1 bg-yellow-600 rounded text-sm"
//                     onClick={async () => {
//                    await transferHost(room.id, m.user.id);
//                    setRoom(await getRoomDetail(roomId));
//                         }}
//                        >
//                       Transfer Host
//                     </button>
//                 <button className="px-3 py-1 bg-red-600 rounded text-sm"
//                   onClick={async () => {
//                     await kickMember(room.id, m.user.id);
//                     setRoom(await getRoomDetail(roomId));
//                   }}>Kick</button>
//               </div>
//             );
//           }
//         })()}
//       </div>
//     ))}
//   </div>
// </div>

//     </div>
//   );
// }

import { useEffect, useState, useRef } from "react";
import { getRoomDetail, addSuggestion, approveSuggestion, addToRoomQueue, removeFromRoomQueue, saveRoomQueueAsPersonal } from "../lib/api";
import { getSearchResults } from "../lib/api";
import useUnifiedSocket from "../hooks/useUnifiedSocket";
import { useParams } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function RoomView() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Chat states
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  
  const bottomRef = useRef();
  const dropdownRef = useRef();
  
  // Use unified socket for both jam and room chat
  const { 
    connected, 
    send, 
    lastMessage,
    messages: chatMessages,
    sendMessage: sendChatMessage,
    connectionStatus,
    isConnected
  } = useUnifiedSocket(roomId, roomId); // roomId for jam, no chatId
  
  const { playSong, seekTo, setIsPlaying, currentSong } = usePlayer();

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user_id);
      } catch (e) {
        console.error("Failed to parse token:", e);
      }
    }
  }, []);

  // Load room details
  useEffect(() => {
    (async () => setRoom(await getRoomDetail(roomId)))();
  }, [roomId]);

  // Search functionality
  useEffect(() => {
    const t = setTimeout(async () => {
      if (search.trim().length < 2) { setResults([]); return; }
      const r = await getSearchResults(search, 10);
      const items = r.songs || r.tracks || r || [];
      setResults(items);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Handle jam control messages
  useEffect(() => {
    if (lastMessage?.type === "jam_control") {
      const data = lastMessage;
      if (data.action === "play") {
        const latencyMs = Date.now() - (data.server_timestamp || Date.now());
        const adjusted = (data.position || 0) + latencyMs / 1000;
        playSong({ 
          yt_video_id: data.track_id, 
          title: data.track_title, 
          artist_name: data.track_artist 
        });
        setTimeout(() => seekTo(adjusted), 150);
        setIsPlaying(true);
      } else if (data.action === "pause") {
        setIsPlaying(false);
      } else if (data.action === "seek") {
        seekTo(data.position || 0);
      }
    }
  }, [lastMessage]);

  // Auto-scroll chat messages
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [chatMessages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canControl = () => {
    if (!room) return false;
    const me = room.members.find(m => m.user.id === currentUserId);
    return me && (me.role === "host" || me.role === "editor");
  };

  const sendChatMsg = async () => {
    if (!input.trim() || !isConnected) return;
    
    const payload = {
      type: "room_chat",
      message: input.trim(),
      room_id: roomId
    };
    
    const success = sendChatMessage(payload);
    if (success) {
      setInput("");
    }
  };

  const submitSuggestion = async (track) => {
    await addSuggestion(roomId, {
      yt_video_id: track.yt_video_id || track.videoId || track.video_id,
      title: track.title,
      artist_name: track.artist_name || track.artist,
      thumbnail_url: track.thumbnail_url || track.thumbnail,
      duration_sec: track.duration_sec || track.durationSeconds || 0
    });
    setRoom(await getRoomDetail(roomId));
    setShowSearch(false);
  };

  const approve = async (sid) => {
    await approveSuggestion(roomId, sid);
    setRoom(await getRoomDetail(roomId));
  };

  const sendPlay = (track) => {
    send({
      type: "play",
      track_id: track.yt_video_id,
      track_title: track.title,
      track_artist: track.artist_name,
      position: 0
    });
  };

  if (!room) return (
    <div className="h-screen bg-[#0d0f12] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div>Loading room...</div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0d0f12] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.history.back()} 
            className="text-gray-400 hover:text-white text-lg"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-bold">🎵</span>
            </div>
            <div>
              <div className="text-sm font-semibold">{room.name}</div>
              <div className="text-xs text-gray-400">
                {room.is_private ? "Private" : "Public"} • Code: {room.join_code}
              </div>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">⋮</button>
      </div>
      
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-lg mb-2">🎵</div>
            <div className="text-sm">Welcome to {room.name}</div>
            <div className="text-xs mt-1 opacity-75">Start chatting and jamming together!</div>
          </div>
        )}
        
        {chatMessages.map((msg, index) => (
          <ChatBubble
            key={`${msg.id || index}-${msg.created_at}`}
            mine={msg.sender_id === currentUserId}
            message={msg.message}
            created_at={msg.created_at}
            senderName={room.members.find(m => m.user.id === msg.sender_id)?.user?.username}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Modals */}
      {showSearch && (
        <SearchModal 
          search={search}
          setSearch={setSearch}
          results={results}
          onSuggest={submitSuggestion}
          onStartJam={(track) => {
            if (canControl()) {
              addToRoomQueue(roomId, {
                yt_video_id: track.yt_video_id || track.videoId || track.video_id,
                title: track.title,
                artist_name: track.artist_name || track.artist,
                thumbnail_url: track.thumbnail_url || track.thumbnail,
                duration_sec: track.duration_sec || track.durationSeconds || 0
              });
              setTimeout(() => sendPlay({
                yt_video_id: track.yt_video_id || track.videoId || track.video_id,
                title: track.title,
                artist_name: track.artist_name || track.artist
              }), 200);
            }
          }}
          canControl={canControl()}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showQueue && (
        <QueueModal 
          queue={room.queue}
          canControl={canControl()}
          onPlay={sendPlay}
          onRemove={async (videoId) => {
            await removeFromRoomQueue(roomId, videoId);
            setRoom(await getRoomDetail(roomId));
          }}
          onSaveAsPersonal={async () => {
            const r = await saveRoomQueueAsPersonal(room.id);
            alert(`Saved as personal playlist: ${r.name}`);
          }}
          onClose={() => setShowQueue(false)}
        />
      )}

      {showSuggestions && (
        <SuggestionsModal 
          suggestions={room.suggestions}
          canControl={canControl()}
          onApprove={approve}
          onClose={() => setShowSuggestions(false)}
        />
      )}

      {showMembers && (
        <MembersModal 
          members={room.members}
          currentUserId={currentUserId}
          onClose={() => setShowMembers(false)}
        />
      )}
      
      {/* Chat Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0d0f12] border-t border-gray-800 "
      style={{ bottom: "60px", zIndex: 15999 }}>
        <div className="flex items-center gap-3 relative">
          {/* Plus Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-12 h-12 bg-[#161a23] rounded-full flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="text-xl">+</span>
            </button>

            {showDropdown && (
              <div className="absolute  left-0 right-0 bottom-[60px] mb-2 bg-[#1a1f2e] rounded-lg shadow-lg p-2 min-w-[180px] z-50"
              style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.3)" , maxHeight: 'calc(100vh - 60px)', overflowY: 'auto'}}>
             {/* <div 
  className="absolute bottom-[60px] left-1/2 transform -translate-x-1/2 
             mb-2 bg-[#1a1f2e] rounded-lg shadow-lg p-2 min-w-[200px] z-50"
  style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.3)", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}
> */}

                <button
                  onClick={() => {
                    setShowSearch(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#252b3c] rounded-lg flex items-center gap-3 text-sm"
                >
                  <span>🔍</span>
                  Search & Add Music
                </button>
                
                <button
                  onClick={() => {
                    setShowQueue(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#252b3c] rounded-lg flex items-center gap-3 text-sm"
                >
                  <span>🎵</span>
                  View Queue ({room.queue.length})
                </button>
                
                <button
                  onClick={() => {
                    setShowSuggestions(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#252b3c] rounded-lg flex items-center gap-3 text-sm"
                >
                  <span>💡</span>
                  Suggestions ({room.suggestions.length})
                </button>
                
                <button
                  onClick={() => {
                    setShowMembers(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#252b3c] rounded-lg flex items-center gap-3 text-sm"
                >
                  <span>👥</span>
                  Members ({room.members.length})
                </button>
                <button
                 onClick={() => {
                setShowDropdown(false);
                setShowPlaylist(true);  // NEW: open playlist modal
                   }}
                 className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-700 flex items-center gap-2"
               >
               <span>🎵</span> Playlist
              </button>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="flex-1 flex items-center bg-[#161a23] rounded-full px-4 py-3">
            <input
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendChatMsg()}
            //   disabled={!isConnected}
            disabled={false} 
            />
            <button 
              onClick={sendChatMsg} 
              disabled={!input.trim() || !isConnected}
              className="ml-3 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>
        
        {/* Connection Status */}
        {!connected && (
          <div className="mt-2 text-xs text-center">
            <span className="text-red-400">⚠️ Not connected to room</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Chat Bubble Component
function ChatBubble({ mine, message, created_at, senderName }) {
  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="relative max-w-[75%]">
        <div
          className={`px-4 py-2 shadow-lg relative ${
            mine 
              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl" 
              : "bg-[#1a1f2e] text-white rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
          }`}
        >
          {!mine && senderName && (
            <div className="text-xs text-pink-400 mb-1 font-semibold">
              {senderName}
            </div>
          )}
          <div className="text-sm leading-relaxed">
            {message}
          </div>
          <div className={`text-[10px] mt-1 opacity-75 ${mine ? 'text-right' : 'text-left'}`}>
            {formatTime(created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal Components
function SearchModal({ search, setSearch, results, onSuggest, onStartJam, canControl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-[#0d0f12] w-full max-h-[80vh] rounded-t-lg">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Search Music</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>
        
        <div className="p-4">
          <input 
            className="w-full p-3 bg-[#161a23] rounded-lg text-white placeholder-gray-400"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search for songs..."
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {results.map((track, i) => {
            const vid = track.yt_video_id || track.videoId || track.video_id || i;
            return (
              <div key={vid} className="flex items-center gap-3 bg-[#111216] p-3 rounded-lg">
                <img src={track.thumbnail_url || track.thumbnail} className="w-12 h-12 rounded" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{track.title}</div>
                  <div className="text-xs text-gray-400">{track.artist_name || track.artist}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 bg-blue-500 rounded text-sm" 
                    onClick={() => onSuggest(track)}
                  >
                    Suggest
                  </button>
                  {canControl && (
                    <button 
                      className="px-3 py-1 bg-pink-500 rounded text-sm" 
                      onClick={() => onStartJam(track)}
                    >
                      Play Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {results.length === 0 && search.length > 2 && (
            <div className="text-center text-gray-400 py-8">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function QueueModal({ queue, canControl, onPlay, onRemove, onSaveAsPersonal, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-[#0d0f12] w-full max-h-[80vh] rounded-t-lg">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Queue</div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onSaveAsPersonal}
              className="px-3 py-1 bg-green-600 rounded text-sm"
            >
              Save as Personal
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {queue.map(track => (
            <div key={track.id} className="flex items-center gap-3 bg-[#111216] p-3 rounded-lg">
              <img src={track.thumbnail_url} className="w-12 h-12 rounded" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{track.title}</div>
                <div className="text-xs text-gray-400">{track.artist_name}</div>
              </div>
              {canControl && (
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 bg-green-600 rounded text-sm" 
                    onClick={() => onPlay(track)}
                  >
                    Play
                  </button>
                  <button 
                    className="px-3 py-1 bg-red-600 rounded text-sm" 
                    onClick={() => onRemove(track.yt_video_id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {queue.length === 0 && (
            <div className="text-center text-gray-400 py-8">No tracks in queue</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionsModal({ suggestions, canControl, onApprove, onClose }) {
  return (
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end  z-50">
    //   <div className="bg-[#0d0f12] w-full max-h-[80vh] rounded-t-lg">
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
  <div className="bg-[#111216] w-full max-w-md max-h-[80vh] rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Suggestions</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="flex items-center gap-3 bg-[#111216] p-3 rounded-lg">
              <img src={suggestion.thumbnail_url} className="w-12 h-12 rounded" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{suggestion.title}</div>
                <div className="text-xs text-gray-400">{suggestion.artist_name}</div>
              </div>
              {canControl && (
                <button 
                  className="px-3 py-1 bg-blue-600 rounded text-sm" 
                  onClick={() => onApprove(suggestion.id)}
                >
                  Approve
                </button>
              )}
              {/* NEW: Add button */}
                {canControl && (
              <button 
               className="ml-2 px-3 py-1 bg-green-600 rounded text-sm" 
               onClick={() => onAddToQueue(suggestion)}
               >
               Add to Queue
             </button>
              )}
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="text-center text-gray-400 py-8">No suggestions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MembersModal({ members, currentUserId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-[#0d0f12] w-full max-h-[80vh] rounded-t-lg">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Members</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {members.map(member => (
            <div key={member.user.id} className="flex items-center gap-3 bg-[#111216] p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {member.user.username[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {member.user.username}
                  {member.user.id === currentUserId && " (You)"}
                </div>
                <div className="text-xs text-gray-400 capitalize">{member.role}</div>
              </div>
              <div className="text-xs text-gray-400">
                {member.role === "host" && "👑"}
                {member.role === "editor" && "✏️"}
                {member.role === "member" && "👤"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



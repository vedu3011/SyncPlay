
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   getRoomDetail,
//   addSuggestion,
//   approveSuggestion,
//   addToRoomQueue,
//   removeFromRoomQueue,
//   saveRoomQueueAsPersonal,
//   promoteToEditor,
//   transferHost,
//   kickMember,
// } from "../lib/api";
// import { getSearchResults } from "../lib/api";
// import useUnifiedSocket from "../hooks/useUnifiedSocket";
// import { usePlayer } from "../contexts/PlayerContext";
// import { importKeyFromB64, encryptText, decryptText } from "../lib/crypto";

// function MessageBubble({ isOwnMessage, ciphertext, timestamp }) {
//   const [text, setText] = useState("...");
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const decrypted = await decryptText(ciphertext);
//         if (!cancelled) setText(decrypted);
//       } catch {
//         if (!cancelled) setText("[encrypted]");
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [ciphertext]);
//   const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   return (
//     <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}>
//       <div className={`max-w-[75%] px-4 py-2 rounded-lg shadow relative
//         ${isOwnMessage ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" : "bg-[#1f2937] text-gray-200"}`}>
//         <div>{text}</div>
//         <div className="text-[10px] opacity-50 mt-1 text-right">{timeStr}</div>
//       </div>
//     </div>
//   );
// }

// export default function RoomView() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();

//   // Room data & permissions
//   const [room, setRoom] = useState(null);
//   const [loadingRoom, setLoadingRoom] = useState(true);
//   const [error, setError] = useState(null);

//   // Search and suggestion queue
//   const [search, setSearch] = useState("");
//   const [searchResults, setSearchResults] = useState([]);

//   // Chat encryption key & messages
//   const [encryptionKey, setEncryptionKey] = useState(null);
//   const [chatMessages, setChatMessages] = useState([]);

//   // Input states
//   const [chatInput, setChatInput] = useState("");
//   const [suggestInput, setSuggestInput] = useState("");

//   // Jam + Chat sockets
//   const {
//     connected: jamConnected,
//     send: sendJam,
//     lastMessage: jamLastMessage,
//     messages: chatSocketMessages,
//     sendMessage: sendChatMessage,
//     connectionStatus: chatConnectionStatus,
//     isConnected: chatIsConnected,
//   } = useUnifiedSocket(roomId, roomId); // use same id for jam + chat sockets in room

//   // Player actions
//   const { playSong, pause, seekTo, currentSong, isPlaying, setIsPlaying } = usePlayer();

//   // Scroll ref for chat
//   const chatEndRef = useRef();

//   // Fetch Room and decrypt key (simplified: reuse roomId as key; or fetch from API)
//   useEffect(() => {
//     async function fetchRoom() {
//       try {
//         setLoadingRoom(true);
//         const data = await getRoomDetail(roomId);
//         setRoom(data);
//         // Assuming room.encryption_key_b64 exists; else generate or fetch actual
//         if(data.encryption_key_b64) {
//           const key = await importKeyFromB64(data.encryption_key_b64);
//           setEncryptionKey(key);
//         }
//         setError(null);
//       } catch(e) {
//         setError("Failed to load room");
//       } finally {
//         setLoadingRoom(false);
//       }
//     }
//     fetchRoom();
//   }, [roomId]);

//   // Load historic chat messages on mount
//   useEffect(() => {
//     async function loadChat() {
//       if (!roomId) return;
//       try {
//         // Replace with real API for loading past messages (e.g. /room/{roomId}/chat-history)
//         const history = await fetch(`/api/rooms/${roomId}/chat-history/`).then(r => r.json());
//         setChatMessages(history);
//       } catch {
//         // ignore
//       }
//     }
//     loadChat();
//   }, [roomId]);

//   // Append new chat messages received from socket
//   useEffect(() => {
//     if (!chatSocketMessages.length) return;

//     const newMsgs = chatSocketMessages.filter(
//       msg => !chatMessages.some(c => c.id === msg.id)
//     );

//     if(newMsgs.length) setChatMessages(prev => [...prev, ...newMsgs]);
//   }, [chatSocketMessages, chatMessages]);

//   // Jam sync messages effect
//   useEffect(() => {
//     if (!jamLastMessage) return;

//     const data = jamLastMessage;
//     if (data.type === "play") {
//       const latency = Date.now() - (data.server_timestamp || Date.now());
//       const adjustedPos = (data.position || 0) + latency / 1000;
//       playSong({ yt_video_id: data.track_id, title: data.track_title, artist: data.track_artist });
//       setTimeout(() => seekTo(adjustedPos), 150);
//       setIsPlaying(true);
//     } else if (data.type === "pause") {
//       pause();
//       setIsPlaying(false);
//     } else if (data.type === "seek") {
//       seekTo(data.position || 0);
//     } else if (data.type === "skip") {
//       playSong({ yt_video_id: data.track_id, title: data.track_title, artist: data.track_artist });
//     }
//   }, [jamLastMessage]);

//   // Auto scroll on new chat message
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatMessages]);

//   // Helpers
//   const getUserId = () => {
//     const token = localStorage.getItem("access_token");
//     if(!token) return null;
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.user_id;
//     } catch { return null; }
//   };

//   const canControl = () => {
//     if (!room) return false;
//     const me = room.members.find(m => m.user.id === getUserId());
//     return me && (me.role === "host" || me.role === "editor");
//   };

//   // Chat sending encrypted message
//   const sendEncryptedChat = async () => {
//     if(!chatInput.trim() || !encryptionKey || !chatIsConnected) return;
//     try {
//       const encrypted = await encryptText(chatInput.trim(), encryptionKey);
//       const payload = { type: "message", ciphertext: JSON.stringify(encrypted) };
//       const sent = sendChatMessage(payload);
//       if(sent) setChatInput("");
//     } catch(e) {
//       alert("Failed to send message");
//     }
//   };

//   // Suggest song to room
//   const suggestSong = async (track) => {
//     await addSuggestion(room.id, {
//       yt_video_id: track.yt_video_id || track.video_id,
//       title: track.title,
//       artist: track.artist || track.artist_name,
//       thumbnail_url: track.thumbnail_url,
//       duration_sec: track.duration_sec || 0,
//     });
//     const updatedRoom = await getRoomDetail(roomId);
//     setRoom(updatedRoom);
//   };

//   // Approve suggestion (host/editor only)
//   const approveSuggestionClick = async (suggestionId) => {
//     await approveSuggestion(roomId, suggestionId);
//     const updatedRoom = await getRoomDetail(roomId);
//     setRoom(updatedRoom);
//   };

//   // Add to queue (host/editor only)
//   const addToQueue = async (track) => {
//     if(!canControl()) return;
//     await addToRoomQueue(roomId, {
//       yt_video_id: track.yt_video_id || track.video_id,
//       title: track.title,
//       artist: track.artist || track.artist_name,
//       thumbnail_url: track.thumbnail_url,
//       duration_sec: track.duration_sec || 0,
//     });
//   };

//   // Play via jam socket broadcast
//   const broadcastPlay = (track) => {
//     sendJam({
//       type: "play",
//       track_id: track.yt_video_id || track.video_id,
//       track_title: track.title,
//       track_artist: track.artist || track.artist_name,
//       position: 0,
//     });
//   };

//   // Start jam with first song in queue
//   const startJam = () => {
//     if (!room.queue.length) {
//       alert("Queue is empty");
//       return;
//     }
//     broadcastPlay(room.queue[0]);
//   };

//   return (
//     <div className="min-h-screen bg-[#0d1117] text-white flex flex-col p-4">

//       <header className="flex justify-between items-center mb-4">
//         <button onClick={() => window.history.back()} className="text-pink-500 hover:text-pink-700">← Back</button>
//         <h1 className="text-2xl font-semibold">{room?.name || "Room"}</h1>
//         <div></div>
//       </header>

//       <div className="flex gap-4 flex-grow overflow-hidden">

//         {/* Left pane: playlist, queue, suggestions */}
//         <div className="w-2/5 flex flex-col gap-4 overflow-y-auto">

//           <section>
//             <div className="mb-1 flex justify-between items-center">
//               <h2 className="text-lg font-semibold">Queue</h2>
//               {canControl() && (
//                 <button className="text-sm bg-pink-600 px-2 py-1 rounded" onClick={startJam}>
//                   Start Jam
//                 </button>
//               )}
//             </div>
//             {room?.queue.length ? (
//               <ul className="space-y-2 max-h-72 overflow-y-auto">
//                 {room.queue.map((track) => (
//                   <li key={track.id} className="flex items-center gap-2 bg-gray-900 rounded p-2">
//                     <img src={track.thumbnail_url} className="w-12 h-12 rounded" alt={track.title} />
//                     <div className="flex-grow">
//                       <div className="text-white font-semibold truncate">{track.title}</div>
//                       <div className="text-gray-400 text-sm truncate">{track.artist}</div>
//                     </div>
//                     {canControl() && (
//                       <>
//                         <button className="text-green-500 px-2" onClick={() => broadcastPlay(track)}>Play</button>
//                         <button className="text-red-500 px-2" onClick={async () => {
//                           await removeFromRoomQueue(roomId, track.yt_video_id);
//                           setRoom(await getRoomDetail(roomId));
//                         }}>Remove</button>
//                       </>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : <p className="text-gray-500">Queue is empty</p>}
//           </section>

//           <section>
//             <h2 className="text-lg font-semibold mb-2">Suggestions</h2>
//             {room?.suggestions.length ? (
//               <ul className="space-y-2 max-h-40 overflow-y-auto">
//                 {room.suggestions.map(s => (
//                   <li key={s.id} className="flex items-center gap-2 bg-gray-900 rounded p-2">
//                     <img src={s.thumbnail_url} className="w-10 h-10 rounded" alt={s.title} />
//                     <div className="flex-grow">
//                       <div className="text-white font-semibold truncate">{s.title}</div>
//                       <div className="text-gray-400 text-sm truncate">{s.artist}</div>
//                     </div>
//                     {canControl() && (
//                       <button className="text-blue-400 px-2" onClick={() => approveSuggestionClick(s.id)}>Approve</button>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : <p className="text-gray-500">No suggestions</p>}
//           </section>

//         </div>

//         {/* Right pane: chat */}
//         <div className="w-3/5 flex flex-col bg-[#12181f] rounded p-4">

//           {/* Chat messages */}
//           <div className="flex-grow overflow-y-auto mb-4 scroll-smooth" style={{ maxHeight: "calc(100vh - 250px)" }}>
//             {chatMessages.length === 0 && (
//               <p className="text-gray-500 text-center">No chat messages yet</p>
//             )}
//             {chatMessages.map((msg) => (
//               <MessageBubble
//                 key={msg.id}
//                 isOwnMessage={msg.sender_id === getUserId()}
//                 ciphertext={msg.ciphertext}
//                 timestamp={msg.created_at}
//               />
//             ))}
//             <div ref={chatEndRef} />
//           </div>

//           {/* Chat input */}
//           <div className="flex gap-2">
//             <input
//               className="flex-grow p-2 rounded bg-[#1f2937] text-white"
//               value={chatInput}
//               onChange={e => setChatInput(e.target.value)}
//               placeholder="Type a message..."
//               onKeyDown={e => { if (e.key === "Enter") sendEncryptedChat(); }}
//               disabled={!chatIsConnected || !encryptionKey}
//               spellCheck={false}
//             />
//             <button
//               disabled={!chatInput.trim() || !chatIsConnected || !encryptionKey}
//               className="bg-pink-600 px-4 py-2 rounded disabled:opacity-50"
//               onClick={sendEncryptedChat}
//             >
//               Send
//             </button>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }

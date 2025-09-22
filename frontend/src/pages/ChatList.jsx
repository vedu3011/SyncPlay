// // src/pages/ChatList.jsx
// import { useEffect, useState } from "react";
// import { listFriends, listRequests, searchUsers, sendFriendRequest, respondRequest } from "../lib/api";
// import { useNavigate } from "react-router-dom";

// export default function ChatList() {
//   const [tab, setTab] = useState("all");
//   const [friends, setFriends] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [showAdd, setShowAdd] = useState(false);
//   const [q, setQ] = useState("");
//   const [suggest, setSuggest] = useState([]);
//   const nav = useNavigate();

//   useEffect(() => {
//     (async () => {
//       if (tab === "requests") setRequests(await listRequests());
//       else setFriends(await listFriends(tab));
//     })();
//   }, [tab]);

//   useEffect(() => {
//     const t = setTimeout(async () => {
//       if (q.trim().length >= 1) setSuggest(await searchUsers(q));
//       else setSuggest([]);
//     }, 250);
//     return () => clearTimeout(t);
//   }, [q]);

//   const openChat = (fid) => nav(`/chat/${fid}`);

//   const sendReq = async (uid) => { await sendFriendRequest(uid); alert("Request sent!"); setQ(""); setSuggest([]); }

//   const accept = async (id) => { await respondRequest(id,"accept"); setTab("all"); }
//   const reject = async (id) => { await respondRequest(id,"reject"); setRequests(await listRequests()); }
//   const ignore = async (id) => { await respondRequest(id,"ignore"); setRequests(await listRequests()); }

//   return (
//     <div className="min-h-screen bg-[#0d0f12] text-white p-4 pb-20">
//       <div className="flex items-center justify-between mb-3">
//         <div className="text-xl font-bold">Chats</div>
//         <button onClick={() => setShowAdd(v => !v)} className="px-3 py-1 bg-pink-500 rounded">Add</button>
//       </div>

//       {showAdd && (
//         <div className="mb-3">
//           <input
//             className="w-full bg-[#161a23] px-3 py-2 rounded"
//             placeholder="Search users…"
//             value={q}
//             onChange={(e)=>setQ(e.target.value)}
//           />
//           {suggest.length>0 && (
//             <div className="bg-[#161a23] rounded mt-2 max-h-64 overflow-y-auto">
//               {suggest.map(u=>(
//                 <div key={u.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 rounded-full bg-gray-700" />
//                     <div className="text-sm">{u.username}</div>
//                   </div>
//                   <button onClick={()=>sendReq(u.id)} className="px-2 py-1 bg-gray-700 rounded text-xs">Add</button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       <div className="flex gap-2 text-xs mb-3">
//         {["all","favorites","active","archived","requests"].map(t=>(
//           <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded ${tab===t?"bg-pink-500":"bg-[#161a23]"}`}>{t}</button>
//         ))}
//       </div>

//       {tab==="requests" ? (
//         <div className="space-y-2">
//           {requests.map(r=>(
//             <div key={r.id} className="bg-[#161a23] p-3 rounded flex items-center justify-between">
//               <div>
//                 <div className="text-sm font-semibold">{r.sender.username}</div>
//                 <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
//               </div>
//               <div className="flex gap-2">
//                 <button onClick={()=>accept(r.id)} className="px-2 py-1 bg-green-600 rounded text-xs">Accept</button>
//                 <button onClick={()=>ignore(r.id)} className="px-2 py-1 bg-gray-600 rounded text-xs">Ignore</button>
//                 <button onClick={()=>reject(r.id)} className="px-2 py-1 bg-red-600 rounded text-xs">Reject</button>
//               </div>
//             </div>
//           ))}
//           {requests.length===0 && <div className="text-gray-400 text-sm">No requests</div>}
//         </div>
//       ):(
//         <div className="space-y-2">
//           {friends.map(f=>(
//             <div key={f.id} onClick={()=>openChat(f.id)} className="bg-[#161a23] p-3 rounded flex items-center justify-between cursor-pointer">
//               <div className="flex items-center gap-2">
//                 <div className="w-9 h-9 rounded-full bg-gray-700" />
//                 <div>
//                   <div className="text-sm font-semibold">{f.other_user.username}</div>
//                   <div className="text-xs text-gray-400">{f.last_message_at ? new Date(f.last_message_at).toLocaleString() : "No chats yet"}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//           {friends.length===0 && <div className="text-gray-400 text-sm">No friends here.</div>}
//         </div>
//       )}
//     </div>
//   );
// }


// src/pages/ChatList.jsx - Simple enhanced version (you can build on this gradually)
import { useEffect, useState, useRef, useCallback } from "react";
import useNotifications from "../hooks/useNotifications";
import { listFriends, listRequests, searchUsers, sendFriendRequest, respondRequest } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const [tab, setTab] = useState("all");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [q, setQ] = useState("");
  const [suggest, setSuggest] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const nav = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  //  useEffect(() => {
  //   API.get("/social/friends/").then(res => setFriends(res.data));
  //   API.get("/social/requests/").then(res => setRequests(res.data));
  // }, []);

   useEffect(() => {
     (async () => {
       try 
       {
        //  setFriends(await listFriends("all"));
        const all = await listFriends("all");
        setFriends(all.map(f => ({ ...f, is_online: false })));
         setRequests(await listRequests());
       } 
       catch (err) {
           console.error("Failed to fetch initial lists", err);
       }
     })();
   }, []);


  // Simple WebSocket connection with auto-reconnect
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setConnectionStatus('connecting');
      // const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/chat/${fid}/?token=${token}`;
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/notifications/?token=${token}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onclose = () => {
        setConnectionStatus('disconnected');
        // Simple reconnect after 3 seconds
        if (reconnectAttemptsRef.current < 5) {
          setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, 3000);
        }
      };
    } catch (error) {
      setConnectionStatus('error');
    }
  }, []);

  // Handle real-time updates
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'new_message':
  //       // Update friend list when new message arrives
  //       setFriends(prevFriends => {
  //         return prevFriends.map(friend => {
  //           if (friend.id === data.friendship_id) {
  //             return {
  //               ...friend,
  //               last_message_at: new Date().toISOString(),
  //               unread_count: (friend.unread_count || 0) + 1
  //             };
  //           }
  //           return friend;
  //         }).sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
  //       });

      setFriends(prevFriends => {
          const updated = prevFriends.map(friend => {
            if (friend.id === data.friendship_id) {
              return {
                ...friend,
                last_message_at: new Date().toISOString(),
                last_message_preview: data.preview || "New message",
                unread_count: (friend.unread_count || 0) + 1,
              };
            }
            return friend;
          });
          // re-sort by activity
          return updated.sort(
            (a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0)
          );
        });
        // If tab is "active", reload only active chats
        if (tab === "active") {
         setFriends(prev => prev.filter(f =>
            f.last_message_at &&
            (new Date() - new Date(f.last_message_at)) < 6 * 60 * 60 * 1000 // last 6h
          ));
        }   
  

        break;

      // case 'user_online':
      //   setOnlineUsers(prev => new Set([...prev, data.user_id]));
      //   break;

      // case 'user_offline':
      //   setOnlineUsers(prev => {
      //     const newSet = new Set(prev);
      //     newSet.delete(data.user_id);
      //     return newSet;
      //   });
      //   break;

      case 'user_online':
        setFriends(prev =>
          prev.map(f =>
            f.other_user.id === data.user_id
              ? { ...f, is_online: true }
              : f
          )
        );
        break;

      case 'user_offline':
        setFriends(prev =>
          prev.map(f =>
            f.other_user.id === data.user_id
              ? { ...f, is_online: false }
              : f
          )
        );
        break;

        case 'friend_request':
        setRequests(prev => [...prev, data.request]);
        break;

        case 'friend_request_response':
       setFriends(prev => [...prev, data.friend]); // accepted
       setRequests(prev => prev.filter(r => r.id !== data.request_id));
        break; 
    }

  }, []);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        // if (tab === "requests") {
        //   setRequests(await listRequests());
        // } else {
        //   setFriends(await listFriends(tab));
        // }
        
         if (tab === "requests") {
          setRequests(await listRequests());
        } else {
          const all = await listFriends("all");
          if (tab === "active") {
            // Active = last_message in last 6h
            setFriends(all.filter(f =>
              f.last_message_at &&
              (new Date() - new Date(f.last_message_at)) < 6 * 60 * 60 * 1000
            ));
          } else {
            setFriends(await listFriends(tab));
          }
        }

      } catch (error) {
        console.error("Failed to load data:", error);
      }
    })();
  }, [tab]);

  // Connect WebSocket
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  // Search functionality
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.trim().length >= 1) {
        try {
          setSuggest(await searchUsers(q));
        } catch (error) {
          setSuggest([]);
        }
      } else {
        setSuggest([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // Helper functions
  const openChat = (fid, otherUser) => {
    // Reset unread count when opening chat
    setFriends(prev => prev.map(f => f.id === fid ? {...f, unread_count: 0} : f));
    nav(`/chat/${fid}`, { state: { otherUser } });
  };

  const sendReq = async (uid) => {
    try {
      await sendFriendRequest(uid);
      alert("Request sent!");
      setQ("");
      setSuggest([]);
    } catch (error) {
      alert("Failed to send request");
    }
  };

  const accept = async (id) => {
    try {
      await respondRequest(id, "accept");
      setTab("all");
    } catch (error) {
      alert("Failed to accept request");
    }
  };

  const reject = async (id) => {
    try {
      await respondRequest(id, "reject");
      setRequests(await listRequests());
    } catch (error) {
      alert("Failed to reject request");
    }
  };

  const ignore = async (id) => {
    try {
      await respondRequest(id, "ignore");
      setRequests(await listRequests());
    } catch (error) {
      alert("Failed to ignore request");
    }
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 60000) return "now";
    if (diffMs < 3600000) return `${Math.floor(diffMs/60000)}m ago`;
    if (diffMs < 86400000) return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
  };

  // Get avatar color
  const getAvatarColor = (username) => {
    const colors = ['from-pink-500 to-purple-500', 'from-blue-500 to-cyan-500', 
                   'from-green-500 to-teal-500', 'from-orange-500 to-red-500'];
    return colors[username?.charCodeAt(0) % colors.length || 0];
  };

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white p-[12px]">
      {/* Header */}
      <div className="sticky top-0 w-full p-4">
        <div className="flex items- center justify-between mb-3">
          <div>
            <div className="text-[20px] font-[800]">Chats</div>
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-400">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="px-3 py-1.5 text-[#dd2476] hover:bg-pink-600 rounded-lg transition-colors"
          >
            {showAdd ? '✕' : '+ Add'}
          </button>
        </div>

        {/* Add Friend Search */}
        {showAdd && (
          <div className="mb-4">
            <input
              className="w-full bg-[#101010] p-[4px] pl-[12px] my-[8px] rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
              placeholder="Search users..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {suggest.length > 0 && (
              <div className="bg-[#101010] p-[4px] rounded-lg mt-2 border border-gray-700">
                {suggest.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-[4px] border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-[32px] h-[32px] mr-[4px] rounded-full bg-[#555] ${getAvatarColor(u.username)} flex items-center justify-center text-xs font-bold`}>
                        {u.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm">{u.username}</span>
                    </div>
                    <button 
                      onClick={() => sendReq(u.id)} 
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 text-xs justify-between my-[8px] mb-[16px]">
          {["all", "favorites", "active", "archived", "requests"].map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`px-3 py-1.5 rounded-lg capitalize ${
                tab === t ? "text-white border-b-2 border-[#fff]" : "text-[#555]"
              }`}
            >
              {t}
              {t === 'requests' && requests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 rounded-full text-xs">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === "requests" ? (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 mt-[8px]">
                    <div className={`w-[48px] h-[48px] rounded-full bg-[#555] ${getAvatarColor(r.sender.username)} flex items-center justify-center font-bold`}>
                      {r.sender.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="ml-[8px]">
                      <div className="text-sm font-semibold">{r.sender.username}</div>
                      <div className="text-xs text-gray-400">{formatTime(r.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex gap-[8px]">
                    <button onClick={() => accept(r.id)} className="px-2 py-1 bg-green-600 rounded text-xs">Accept</button>
                    <button onClick={() => ignore(r.id)} className="px-2 py-1 bg-gray-600 rounded text-xs">Ignore</button>
                    <button onClick={() => reject(r.id)} className="px-2 py-1 bg-red-600 rounded text-xs">Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-lg mb-2">📮</div>
                <div className="text-sm">No friend requests</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 flex flex-col gap-[4px]">
            {friends.map(f => {
              // const isOnline = onlineUsers.has(f.other_user.id);
              const isOnline = f.is_online;
              const unreadCount = f.unread_count || 0;
              
              return (
                <div 
                  key={f.id} 
                  onClick={() => openChat(f.id, f.other_user)} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-[#1a1f2e] ${
                    unreadCount > 0 ? 'bg-[#161a23] border border-pink-500/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mt-[8px]">
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className={`w-[48px] h-[48px] rounded-full bg-[#555] ${getAvatarColor(f.other_user.username)} flex items-center justify-center text-sm font-bold`}>
                        {f.other_user.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0d0f12]" />
                      )}
                    </div>
                    
                    {/* Chat info */}
                    <div className="flex-1 min-w-0 ml-[8px]">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-semibold ${unreadCount > 0 ? 'text-white' : 'text-gray-200'}`}>
                          {f.other_user.username}
                          {isOnline && <span className="ml-2 text-xs text-green-400">online</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Unread badge */}
                          {unreadCount > 0 && (
                            <div className="px-1.5 py-0.5 bg-pink-500 text-white rounded-full text-xs min-w-[18px] text-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                          {/* Timestamp */}
                          <div className={`text-xs ${unreadCount > 0 ? 'text-[#fff]' : 'text-[#555]'}`}>
                            {formatTime(f.last_message_at)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Last message preview */}
                      <div className={`text-xs mt-0.5 truncate ${unreadCount > 0 ? 'text-gray-300' : 'text-[#555]'}`}>
                        {f.last_message_preview || (f.last_message_at ? "New message" : "No messages yet")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {friends.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <div className="text-3xl mb-3">💬</div>
                <div className="text-lg mb-2">No chats yet</div>
                <div className="text-sm">Add friends to start chatting!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

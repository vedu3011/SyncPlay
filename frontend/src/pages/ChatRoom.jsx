



// src/pages/ChatRoom.jsx - Updated with mini player spacing
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getFriendshipSecret, getHistory } from "../lib/api";
import { importKeyFromB64, encryptText, decryptText } from "../lib/crypto";
// import useChatSocket from "../hooks/useChatSocket";
import useUnifiedSocket from "../hooks/useUnifiedSocket";
import { usePlayer } from "../contexts/PlayerContext"; // Add this import
import { createCollaborativePlaylist, listFriendshipPlaylists } from "../lib/api";
import { useNavigate } from "react-router-dom";

import JamUI from './JamUI';


export default function ChatRoom() {
  const { fid } = useParams();
  const [key, setKey] = useState(null);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showJam, setShowJam] = useState(false);

  const bottomRef = useRef();
  const now = Date.now();
  const ttlMs = 2 * 60 * 60 * 1000; // 2h (match backend)
  const navigate = useNavigate();

 
  // Add player context to check if mini player is active
  const { currentSong, isFullPlayerOpen } = usePlayer();
  const isMiniPlayerActive = currentSong && !isFullPlayerOpen;

  // const { 
  //   messages: wsMessages, 
  //   sendMessage, 
  //   connectionStatus, 
  //   isConnected 
  // } = useChatSocket(fid);

  const { 
  messages: wsMessages, 
  sendMessage, 
  connectionStatus, 
  isConnected,} = useUnifiedSocket(null, fid); // roomId=null, chatId=fid
  
  

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

  // Load encryption key and chat history
  useEffect(() => {
    (async () => {
      try {
        console.log("Loading chat data for friendship:", fid);
        
        const secret_b64 = await getFriendshipSecret(fid);
        const k = await importKeyFromB64(secret_b64);
        setKey(k);
        
        const historyData = await getHistory(fid);
        console.log("Loaded history:", historyData);
        setHistory(historyData);
        
      } catch (error) {
        console.error("Failed to load chat:", error);
      }
    })();
  }, [fid]);

  // Merge and deduplicate messages whenever history or wsMessages change
  useEffect(() => {
    const combined = [...history];
    
    // Add WebSocket messages that aren't already in history
    wsMessages.forEach(wsMsg => {
      const exists = history.some(histMsg => histMsg.id === wsMsg.id);
      if (!exists) {
        combined.push(wsMsg);
      }
    });
    
    // Sort by creation time
    combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const fresh = combined.filter(m => now - new Date(m.created_at).getTime() < ttlMs);
    // setAllMessages(combined);
    setAllMessages(fresh);

    
    // Auto-scroll when messages change
    setTimeout(scrollBottom, 100);
  }, [history, wsMessages]);

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const send = async () => {
    if (!input.trim() || !key || !isConnected) {
      console.warn("Cannot send:", { 
        hasInput: !!input.trim(), 
        hasKey: !!key, 
        isConnected 
      });
      return;
    }
    
    try {
      console.log("Encrypting message:", input.trim());
      const ct = await encryptText(key, input.trim());
      
      const payload = {
        type: "message",
        ciphertext: JSON.stringify(ct),
      };
      
      console.log("Sending message payload:", payload);
      const success = sendMessage(payload);
      
      if (success) {
        setInput("");
        console.log("Message sent successfully");
      } else {
        console.error("Failed to send message");
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Failed to encrypt/send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const renderText = async (ciphertext) => {
    if (!key) return "Loading...";
    try {
      // const obj = JSON.parse(ciphertext);
      const obj = typeof ciphertext === "string" ? JSON.parse(ciphertext) : ciphertext;
      return await decryptText(key, obj);
    } catch (error) {
      console.error("Decryption failed:", error);
      return "[cannot decrypt]";
    }
  };

  const goBack = () => {
    window.history.back();
  };


  // Updated openSharedPlaylistHandler in ChatRoom.jsx
async function openSharedPlaylistHandler(fid) {
  console.log("Attempting to open playlist for friendship ID:", fid);
  
  try {
    const pls = await listFriendshipPlaylists(fid);
    
    if (!pls || pls.length === 0) {
      // No shared playlist; offer to create
      if (confirm("No shared playlist found. Create one now?")) {
        await createCollaborativePlaylistHandler(fid);
      }
      return;
    }
    
    // Open first playlist (or show picker modal)  /jam/playlists/by_friendship/${friendshipId}
    const selected = pls[0];
    // navigate(`/playlist/${selected.id}`);
    navigate(`/jam/playlists/by_friendship/${selected.id}`)
    
  } catch (e) {
    console.error("Failed to open shared playlist", e);
    
    if (e.response?.status === 404) {
      // Friendship doesn't exist
      alert(`Friendship with ID ${fid} was not found. This might be because:
      - The friendship was deleted
      - You don't have permission to access this friendship
      - The friendship ID in the URL is incorrect`);
    } else if (e.response?.status === 403) {
      // Permission denied
      alert("You don't have permission to access this friendship's playlists.");
    } else {
      // Other error
      alert("Could not open playlist. Please try again later.");
    }
  }
}

async function createCollaborativePlaylistHandler(fid) {
  console.log("Attempting to create playlist for friendship ID:", fid);
  
  try {
    const name = customName || `Shared Playlist - ${new Date().toLocaleDateString()}`;
    const pl = await createCollaborativePlaylist(fid, `Shared - ${new Date().toLocaleDateString()}`);
    console.log("Created playlist:", pl);
    navigate(`/playlist/${pl.id}`);
  } catch (e) {
    console.error("Failed to create playlist", e);
    
    if (e.response?.status === 404) {
      alert(`Cannot create playlist: Friendship with ID ${fid} was not found.`);
    } else if (e.response?.status === 403) {
      alert("You don't have permission to create a playlist for this friendship.");
    } else {
      alert("Could not create playlist. Please try again later.");
    }
  }
}
const handleCreatePlaylistWithName = () => {
  if (playlistName.trim()) {
    createCollaborativePlaylistHandler(fid, playlistName.trim());
    setShowPlaylistNameModal(false);
    setPlaylistName("");
    setShowModal(false);
  }
};
  // Calculate bottom padding based on mini player presence
  const messagesBottomPadding = isMiniPlayerActive ? 'pb-48' : 'pb-32'; // 192px vs 128px

  return (
    <div className="h-screen bg-[#0d0f12] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={goBack} 
            className="text-gray-400 hover:text-white text-lg"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-bold">👤</span>
            </div>
            <div>
              <div className="text-sm font-semibold">
                {otherUser?.username || "Friend"}
              </div>
              <div className="text-xs text-gray-400">
                {connectionStatus === 'connected' && 'Online'}
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'disconnected' && 'Offline'}
                {connectionStatus === 'error' && 'Connection Error'}
              </div>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">⋮</button>
      </div>
      
      {/* Messages area - dynamic padding based on mini player */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${messagesBottomPadding}`}>
        {allMessages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-lg mb-2">💬</div>
            <div className="text-sm">No messages yet</div>
            <div className="text-xs mt-1 opacity-75">Start the conversation!</div>
          </div>
        )}
        
        {allMessages.map((m, index) => (
          <MessageBubble
            key={`${m.id || index}-${m.created_at}`}
            mine={m.sender_id === currentUserId}
            textPromise={renderText(m.ciphertext)}
            created_at={m.created_at}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      
      {/* Input area - always positioned above navbar, below mini player when active */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-[#0d0f12] border-t border-gray-800 z-[12000]">
        <div className="flex items-center gap-3">
          {/* Plus button for jamming features */}
          {/* Plus button to open the modal */}
<button
  className="w-12 h-12 bg-[#161a23] rounded-full flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors"
  onClick={() => setShowModal(true)}
>
  <span className="text-xl">+</span>
</button>

{showModal && (
  <div className="modal bg-gray-900 p-4 rounded shadow-lg absolute bottom-20 left-4 z-50">
    <button
      onClick={async () => {
        const created = await createCollaborativePlaylist(fid, "Jam Playlist");
        if (created?.id) openSharedPlaylistHandler(fid);
        setShowModal(false);
      }}
      className="block w-full mb-2 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
    >
      Create Playlist
    </button>

    <button
      onClick={async () => {
        const playlists = await listFriendshipPlaylists(fid);
        if (playlists?.length > 0) {
          openSharedPlaylistHandler(fid); // open first shared playlist
        } else {
          alert("No playlist found. Please create one first.");
        }
        setShowModal(false);
      }}
      className="block w-full mb-2 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
    >
      Open Playlist
    </button>

    <button
      onClick={() => {
        setShowModal(false);
        setShowJam(true);
      }}
      className="block w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
    >
      Start Jam
    </button>

    <button
      onClick={() => setShowModal(false)}
      className="mt-2 block w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
    >
      Cancel
    </button>
  </div>
)}
         {/* Jam UI */}
          {/* {showJam && <JamUI friendshipId={fid}
          onClose={() => setShowJam(false)} />} */}
          {showJam && <JamUI 
  connected={isConnected}
  send={sendMessage}
  lastMessage={wsMessages[wsMessages.length - 1]} // Get the latest message
  isOpen={showJam}
  onClose={() => setShowJam(false)} 
/>}

         
          
          {/* Message input */}
          <div className="flex-1 flex items-center bg-[#161a23] rounded-full px-4 py-3">
            <input
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && send()}
              disabled={!isConnected || !key}
            />
            <button 
              onClick={send} 
              disabled={!input.trim() || !isConnected || !key}
              className="ml-3 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>
        
        {/* Connection status */}
        {!isConnected && (
          <div className="mt-2 text-xs text-center">
            <span className={`px-2 py-1 rounded ${
              connectionStatus === 'connecting' ? 'text-yellow-400' :
              connectionStatus === 'error' ? 'text-red-400' :
              connectionStatus === 'auth_error' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {connectionStatus === 'connecting' && '🔄 Connecting...'}
              {connectionStatus === 'error' && '⚠️ Connection failed'}
              {connectionStatus === 'auth_error' && '🔒 Authentication failed'}
              {connectionStatus === 'disconnected' && '📡 Disconnected'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ mine, textPromise, created_at }) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    textPromise
      .then(decryptedText => {
        setText(decryptedText);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Decryption failed:", error);
        setText("[failed to decrypt]");
        setIsLoading(false);
      });
  }, [textPromise]);

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
        {/* Message bubble */}
        <div
          className={`px-4 py-2 shadow-lg relative ${
            mine 
              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl" 
              : "bg-[#1a1f2e] text-white rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
          }`}
        >
          <div className="text-sm leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-1 py-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            ) : (
              text
            )}
          </div>
          <div className={`text-[10px] mt-1 opacity-75 ${mine ? 'text-right' : 'text-left'}`}>
            {formatTime(created_at)}
          </div>
        </div>
        
        {/* WhatsApp-like tail using border trick */}
        {mine ? (
          // Right tail for sender
          <div 
            className="absolute bottom-0 right-0 w-0 h-0"
            style={{
              borderLeft: '10px solid #ec4899',
              borderBottom: '10px solid transparent',
              transform: 'translateX(2px)'
            }}
          />
        ) : (
          // Left tail for receiver  
          <div 
            className="absolute bottom-0 left-0 w-0 h-0"
            style={{
              borderRight: '10px solid #1a1f2e',
              borderBottom: '10px solid transparent',
              transform: 'translateX(-2px)'
            }}
          />
        )}
      </div>
    </div>
  );
}






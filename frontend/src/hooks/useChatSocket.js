// // / src/hooks/useChatSocket.js - Fixed version with correct token handling
// import { useEffect, useRef, useState, useCallback } from "react";

// export default function useChatSocket(chatId) {
//   const [messages, setMessages] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const socketRef = useRef(null);
//   const reconnectRef = useRef(0);
//   const reconnectTimeoutRef = useRef(null);
//   const isConnectingRef = useRef(false);

//   const getToken = () => {
//     // Match your axios.js token usage
//     const token = localStorage.getItem('access_token');
//     console.log('🎯 Using access_token:', token ? `Found (${token.substring(0, 20)}...)` : 'Not found');
//     return token;
//   };

//   const cleanup = useCallback(() => {
//     console.log('🧹 Cleaning up WebSocket connection...');
    
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
    
//     if (socketRef.current) {
//       const ws = socketRef.current;
//       socketRef.current = null;
      
//       ws.onopen = null;
//       ws.onmessage = null;
//       ws.onclose = null;
//       ws.onerror = null;
      
//       if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
//         ws.close(1000, 'Component cleanup');
//       }
//     }
    
//     isConnectingRef.current = false;
//     setConnectionStatus('disconnected');
//   }, []);

//   const connect = useCallback(() => {
//     if (isConnectingRef.current) {
//       console.log('⚠️ Connection already in progress, skipping...');
//       return;
//     }

//     const token = getToken();
    
//     if (!token) {
//       console.error("❌ No authentication token found");
//       setConnectionStatus('auth_error');
//       return;
//     }

//     cleanup();
    
//     isConnectingRef.current = true;
//     setConnectionStatus('connecting');
    
//     const url = `ws://127.0.0.1:8000/ws/chat/${chatId}/?token=${token}`;
//     console.log("🔌 Connecting to WebSocket for chat:", chatId);

//     try {
//       const ws = new WebSocket(url);
//       socketRef.current = ws;

//       const connectionTimeout = setTimeout(() => {
//         if (ws.readyState === WebSocket.CONNECTING) {
//           console.log("⏰ Connection timeout");
//           ws.close();
//         }
//       }, 10000);

//       ws.onopen = () => {
//         console.log("✅ WebSocket connected successfully");
//         clearTimeout(connectionTimeout);
//         isConnectingRef.current = false;
//         setConnectionStatus('connected');
//         reconnectRef.current = 0;
//       };

//       ws.onmessage = (e) => {
//         try {
//           const data = JSON.parse(e.data);
//           console.log("📨 Received WebSocket message:", data);
          
//           // Handle different message types from your backend
//           if (data.type === "chat.message" || data.type === "message") {
//             // Transform backend message format to frontend format
//             const message = {
//               id: data.id || Date.now(), // Fallback ID if not provided
//               ciphertext: data.ciphertext || data.message,
//               sender_id: data.sender_id,
//               created_at: data.created_at || new Date().toISOString(),
//             };
            
//             setMessages((prev) => {
//               // Prevent duplicates
//               const exists = prev.some(m => m.id === message.id);
//               if (exists) return prev;
//               return [...prev, message];
//             });
//           }
//         } catch (error) {
//           console.error("❌ Error parsing WebSocket message:", error, e.data);
//         }
//       };

//       ws.onclose = (event) => {
//         console.log(`❌ WebSocket closed (code: ${event.code}), reason: ${event.reason}`);
//         clearTimeout(connectionTimeout);
//         isConnectingRef.current = false;
        
//         if (socketRef.current === ws) {
//           setConnectionStatus('disconnected');
//           socketRef.current = null;
//         }
        
//         const shouldNotReconnect = [1000, 1001, 403];
        
//         if (shouldNotReconnect.includes(event.code)) {
//           if (event.code === 403) {
//             console.error("❌ Authentication failed - please log in again");
//             setConnectionStatus('auth_error');
//           } else {
//             console.log("🛑 Connection closed normally, not reconnecting");
//           }
//           return;
//         }
        
//         if (socketRef.current === ws || socketRef.current === null) {
//           if (reconnectRef.current < 5) {
//             const timeout = Math.min(10000, 1000 * 2 ** reconnectRef.current);
//             console.log(`🔄 Reconnecting in ${timeout}ms (attempt ${reconnectRef.current + 1}/5)`);
//             reconnectRef.current++;
            
//             reconnectTimeoutRef.current = setTimeout(() => {
//               if (chatId) connect();
//             }, timeout);
//           } else {
//             console.error("❌ Max reconnection attempts reached");
//             setConnectionStatus('failed');
//           }
//         }
//       };

//       ws.onerror = (err) => {
//         console.error("⚠️ WebSocket error:", err);
//         clearTimeout(connectionTimeout);
//         isConnectingRef.current = false;
        
//         if (socketRef.current === ws) {
//           setConnectionStatus('error');
//         }
//       };

//     } catch (error) {
//       console.error("❌ Failed to create WebSocket:", error);
//       isConnectingRef.current = false;
//       setConnectionStatus('error');
//     }
//   }, [chatId, cleanup]);

//   const reconnect = useCallback(() => {
//     console.log("🔄 Manual reconnect triggered");
//     reconnectRef.current = 0;
//     connect();
//   }, [connect]);

//   useEffect(() => {
//     if (chatId) {
//       console.log(`🎯 Initializing WebSocket for chat ${chatId}`);
//       connect();
//     }
    
//     return () => {
//       console.log('🧹 Component unmounting or chatId changed');
//       cleanup();
//     };
//   }, [chatId]);

//   const sendMessage = useCallback((payload) => {
//     if (socketRef.current?.readyState === WebSocket.OPEN) {
//       console.log("📤 Sending message:", payload);
//       try {
//         socketRef.current.send(JSON.stringify(payload));
//         return true;
//       } catch (error) {
//         console.error("❌ Failed to send message:", error);
//         return false;
//       }
//     } else {
//       console.warn("⚠️ WebSocket not connected. Status:", connectionStatus);
//       return false;
//     }
//   }, [connectionStatus]);

//   return { 
//     messages, 
//     sendMessage, 
//     connectionStatus, 
//     reconnect,
//     isConnected: connectionStatus === 'connected'
//   };
// }
// src/hooks/useUnifiedSocket.js - Dual WebSocket Manager for Jam and Chat
import { useEffect, useRef, useState, useCallback } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function useUnifiedSocket(roomId, chatId) {
  // Jam Socket States
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  // Chat Socket States
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Separate WebSocket References
  const jamSocketRef = useRef(null);
  const chatSocketRef = useRef(null);
  
  // Separate Reconnection Management
  const jamReconnectAttemptRef = useRef(0);
  const jamReconnectTimeoutRef = useRef(null);
  const chatReconnectRef = useRef(0);
  const chatReconnectTimeoutRef = useRef(null);
  const chatIsConnectingRef = useRef(false);
  const jamIsConnectingRef = useRef(false);

  const { playSong, seekTo, setIsPlaying } = usePlayer();

  const getToken = () => {
    const token = localStorage.getItem('access_token');
    console.log('🎯 Using access_token:', token ? `Found (${token.substring(0, 20)}...)` : 'Not found');
    return token;
  };

  // Jam Socket Cleanup
  const cleanupJam = useCallback(() => {
    console.log('🧹 Cleaning up JAM WebSocket connection...');
    
    if (jamReconnectTimeoutRef.current) {
      clearTimeout(jamReconnectTimeoutRef.current);
      jamReconnectTimeoutRef.current = null;
    }
    
    if (jamSocketRef.current) {
      try {
        jamSocketRef.current.onopen = null;
        jamSocketRef.current.onerror = null;
        jamSocketRef.current.onmessage = null;
        jamSocketRef.current.onclose = null;
        jamSocketRef.current.close(1000, "cleanup");
      } catch (e) {
        // ignore close errors
      }
      jamSocketRef.current = null;
    }
    
    jamIsConnectingRef.current = false;
    setConnected(false);
  }, []);

  // Chat Socket Cleanup
  const cleanupChat = useCallback(() => {
    console.log('🧹 Cleaning up CHAT WebSocket connection...');
    
    if (chatReconnectTimeoutRef.current) {
      clearTimeout(chatReconnectTimeoutRef.current);
      chatReconnectTimeoutRef.current = null;
    }
    
    if (chatSocketRef.current) {
      const ws = chatSocketRef.current;
      chatSocketRef.current = null;
      
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component cleanup');
      }
    }
    
    chatIsConnectingRef.current = false;
    setConnectionStatus('disconnected');
  }, []);

  // Combined Cleanup
  const cleanup = useCallback(() => {
    cleanupJam();
    cleanupChat();
  }, [cleanupJam, cleanupChat]);

  // Jam Message Handler
  const handleJamMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[JamSocket] WS message received:", data);
        setLastMessage(data);

        if (data.type === "jam_control") {
          console.log("[JamSocket] jam_control action:", data.action);

          if (data.action === "play") {
            const serverTs = data.server_timestamp || Date.now();
            const latencyMs = Date.now() - serverTs;
            const adjustedPos = (data.position || 0) + latencyMs / 1000;

            console.log("[JamSocket] Playing track from jam_control, video_id:", data.track_id);
            console.log(`[JamSocket] Latency: ${latencyMs}ms, seeking to: ${adjustedPos.toFixed(2)}s`);

            playSong({
              yt_video_id: data.track_id,
              title: data.track_title,
              artist_name: data.track_artist,
            });

            setTimeout(() => {
              seekTo(adjustedPos);
            }, 150);

            setIsPlaying(true);
          } else if (data.action === "pause") {
            setIsPlaying(false);
          } else if (data.action === "seek") {
            seekTo(data.position || 0);
          } else if (data.action === "skip") {
            playSong({
              yt_video_id: data.track_id,
              title: data.track_title,
              artist_name: data.track_artist,
            });
          }
        }
      } catch (err) {
        console.error("[JamSocket] Error parsing WS message", err);
      }
    },
    [playSong, seekTo, setIsPlaying]
  );

  // Chat Message Handler
  const handleChatMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 [ChatSocket] Received WebSocket message:", data);
      
      // Handle different message types from your backend
      if (data.type === "chat.message" || data.type === "message") {
        // Transform backend message format to frontend format
        const message = {
          id: data.id || Date.now(),
          ciphertext: data.ciphertext || data.message,
          sender_id: data.sender_id,
          created_at: data.created_at || new Date().toISOString(),
        };
        
        setMessages((prev) => {
          // Prevent duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    } catch (error) {
      console.error("❌ [ChatSocket] Error parsing WebSocket message:", error, event.data);
    }
  }, []);

  // Connect to Jam Socket
  const connectJam = useCallback(() => {
    if (jamIsConnectingRef.current || !roomId) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("❌ No token for Jam socket, aborting connect");
      return;
    }

    cleanupJam();
    jamIsConnectingRef.current = true;

    const url = `${import.meta.env.VITE_WS_BASE || "ws://127.0.0.1:8000"}/ws/jam/${roomId}/?token=${token}`;
    console.log("[JamSocket] Connecting to", url);

    const ws = new WebSocket(url);
    jamSocketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Jam socket connected");
      jamIsConnectingRef.current = false;
      setConnected(true);
      jamReconnectAttemptRef.current = 0;
    };

    ws.onclose = (e) => {
      console.warn("❌ Jam socket closed", e.code, e.reason);
      jamIsConnectingRef.current = false;
      setConnected(false);

      if (e.code === 403) {
        console.error("⚠️ Jam token expired or unauthorized");
        return;
      }

      if (jamReconnectAttemptRef.current < 5) {
        const delay = 1000 * 2 ** jamReconnectAttemptRef.current;
        jamReconnectAttemptRef.current += 1;
        jamReconnectTimeoutRef.current = setTimeout(connectJam, delay);
        console.log(`[JamSocket] Reconnecting in ${delay} ms`);
      } else {
        console.error("[JamSocket] Max reconnect attempts reached");
      }
    };

    ws.onerror = (err) => {
      console.error("⚠️ Jam socket encountered error", err);
      jamIsConnectingRef.current = false;
      ws.close();
    };

    ws.onmessage = handleJamMessage;
  }, [roomId, cleanupJam, handleJamMessage]);

  // Connect to Chat Socket (with delay to avoid conflicts)
  const connectChat = useCallback(() => {
    if (chatIsConnectingRef.current || !chatId) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("❌ No authentication token found for chat");
      setConnectionStatus('auth_error');
      return;
    }

    cleanupChat();
    chatIsConnectingRef.current = true;
    setConnectionStatus('connecting');
    
    const url = `ws://127.0.0.1:8000/ws/chat/${chatId}/?token=${token}`;
    console.log("🔌 [ChatSocket] Connecting to WebSocket for chat:", chatId);

    try {
      const ws = new WebSocket(url);
      chatSocketRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log("⏰ [ChatSocket] Connection timeout");
          ws.close();
        }
      }, 10000);

      ws.onopen = () => {
        console.log("✅ [ChatSocket] WebSocket connected successfully");
        clearTimeout(connectionTimeout);
        chatIsConnectingRef.current = false;
        setConnectionStatus('connected');
        chatReconnectRef.current = 0;
      };

      ws.onmessage = handleChatMessage;

      ws.onclose = (event) => {
        console.log(`❌ [ChatSocket] WebSocket closed (code: ${event.code}), reason: ${event.reason}`);
        clearTimeout(connectionTimeout);
        chatIsConnectingRef.current = false;
        
        if (chatSocketRef.current === ws) {
          setConnectionStatus('disconnected');
          chatSocketRef.current = null;
        }
        
        const shouldNotReconnect = [1000, 1001, 403];
        
        if (shouldNotReconnect.includes(event.code)) {
          if (event.code === 403) {
            console.error("❌ [ChatSocket] Authentication failed");
            setConnectionStatus('auth_error');
          }
          return;
        }
        
        if (chatReconnectRef.current < 5) {
          const timeout = Math.min(10000, 1000 * 2 ** chatReconnectRef.current);
          console.log(`🔄 [ChatSocket] Reconnecting in ${timeout}ms (attempt ${chatReconnectRef.current + 1}/5)`);
          chatReconnectRef.current++;
          
          chatReconnectTimeoutRef.current = setTimeout(() => {
            if (chatId) connectChat();
          }, timeout);
        } else {
          console.error("❌ [ChatSocket] Max reconnection attempts reached");
          setConnectionStatus('failed');
        }
      };

      ws.onerror = (err) => {
        console.error("⚠️ [ChatSocket] WebSocket error:", err);
        clearTimeout(connectionTimeout);
        chatIsConnectingRef.current = false;
        
        if (chatSocketRef.current === ws) {
          setConnectionStatus('error');
        }
      };

    } catch (error) {
      console.error("❌ [ChatSocket] Failed to create WebSocket:", error);
      chatIsConnectingRef.current = false;
      setConnectionStatus('error');
    }
  }, [chatId, cleanupChat, handleChatMessage]);

  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnect triggered for both sockets");
    jamReconnectAttemptRef.current = 0;
    chatReconnectRef.current = 0;
    
    if (roomId) {
      connectJam();
    }
    
    // Stagger chat connection by 500ms to avoid conflicts
    if (chatId) {
      setTimeout(connectChat, 500);
    }
  }, [connectJam, connectChat, roomId, chatId]);

  useEffect(() => {
    if (roomId) {
      console.log(`🎯 Initializing Jam WebSocket for room: ${roomId}`);
      connectJam();
    }

    // Stagger chat connection by 300ms to avoid resource conflicts
    if (chatId) {
      console.log(`🎯 Initializing Chat WebSocket for chat: ${chatId}`);
      setTimeout(connectChat, 300);
    }

    return () => {
      console.log('🧹 Component unmounting - cleaning up both sockets');
      cleanup();
    };
  }, [roomId, chatId]);

  // Jam Socket send function
  const send = useCallback(
    (payload) => {
      if (jamSocketRef.current?.readyState === WebSocket.OPEN) {
        jamSocketRef.current.send(JSON.stringify(payload));
        console.log("[JamSocket] WS message sent:", payload);
        return true;
      } else {
        console.warn("[JamSocket] WS not open, message not sent:", payload);
        return false;
      }
    },
    []
  );

  // Chat Socket send function
  const sendMessage = useCallback((payload) => {
    if (chatSocketRef.current?.readyState === WebSocket.OPEN) {
      console.log("📤 [ChatSocket] Sending message:", payload);
      try {
        chatSocketRef.current.send(JSON.stringify(payload));
        return true;
      } catch (error) {
        console.error("❌ [ChatSocket] Failed to send message:", error);
        return false;
      }
    } else {
      console.warn("⚠️ [ChatSocket] WebSocket not connected. Status:", connectionStatus);
      return false;
    }
  }, [connectionStatus]);

  // Return both socket interfaces exactly as they were
  return { 
    // Jam Socket Interface
    connected, 
    send, 
    lastMessage,
    
    // Chat Socket Interface
    messages, 
    sendMessage, 
    connectionStatus, 
    reconnect,
    isConnected: connectionStatus === 'connected'
  };
}











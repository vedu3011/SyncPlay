// src/hooks/useChatListSocket.js - WebSocket hook for chat list updates
import { useEffect, useRef, useCallback, useState } from 'react';

const useChatListSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastMessage, setLastMessage] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("No token available for WebSocket connection");
      setConnectionStatus('auth_error');
      return;
    }

    try {
      setConnectionStatus('connecting');
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/chat/${fid}/?token=${token}}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("Global chat WebSocket connected");
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Request current online users
        wsRef.current.send(JSON.stringify({
          type: 'get_online_users'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("Global chat WebSocket disconnected", event.code);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect logic
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Attempting to reconnect in ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.log("Max reconnection attempts reached");
          setConnectionStatus('failed');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("Global chat WebSocket error:", error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setConnectionStatus('error');
    }
  }, []);

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'new_message':
        setLastMessage({
          friendship_id: data.friendship_id,
          preview: data.preview,
          timestamp: data.timestamp,
          sender_id: data.sender_id
        });
        break;

      case 'user_online':
        setOnlineUsers(prev => new Set([...prev, data.user_id]));
        break;

      case 'user_offline':
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.user_id);
          return newSet;
        });
        break;

      case 'online_users':
        setOnlineUsers(new Set(data.users || []));
        break;

      case 'message_read':
        // This can be used to update read status
        setLastMessage({
          type: 'read',
          friendship_id: data.friendship_id,
          timestamp: data.timestamp
        });
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setConnectionStatus('disconnected');
  }, []);

  const manualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    connectionStatus,
    onlineUsers,
    lastMessage,
    manualReconnect,
    isConnected: connectionStatus === 'connected'
  };
};

export default useChatListSocket;
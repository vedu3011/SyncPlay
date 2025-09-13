import { useEffect, useRef, useState } from "react";

export default function useRoomSocket(roomId) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("access_token");
    const base = import.meta.env.VITE_WS_BASE || "ws://127.0.0.1:8000";
    const url = `${base}/ws/rooms/${roomId}/?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  const send = (payload) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify(payload));
    return true;
  };

  const onMessage = (handler) => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        handler(data);
      } catch (err) {
        console.error("WS parse", err);
      }
    };
  };

  return { connected, send, onMessage };
}

// frontend/src/hooks/useNotification.js
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

export default function useNotifications(onEvent) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
    );
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Notifications WS connected");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("🔔 Notification event:", data);

      // toast + callback to parent
      if (data.type === "friend_request") {
        toast.success(`New friend request from ${data.request.sender.username}`);
      }
      if (data.type === "friend_request_response") {
        if (data.status === "accepted") {
          toast.success("✅ Your friend request was accepted!");
        } else if (data.status === "rejected") {
          toast.error("❌ Your friend request was rejected.");
        } else if (data.status === "ignored") {
          toast("⚠️ Your request was ignored.");
        }
      }

      if (onEvent) onEvent(data);
    };

    ws.onclose = () => {
      console.log("❌ Notifications WS closed");
    };

    return () => ws.close();
  }, [onEvent]);
}

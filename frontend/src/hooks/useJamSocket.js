

// // // src/hooks/useJamSocket.js
// // import { useEffect, useRef, useState, useCallback, useContext } from "react";
// // import { usePlayer } from "../contexts/PlayerContext";

// // export default function useJamSocket(roomId) {
// //   const [connected, setConnected] = useState(false);
// //   const socketRef = useRef(null);
// //   const reconnectRef = useRef(0);
// //   const reconnectTimeoutRef = useRef(null);



// //   // Player context for playback control
// //   const { playSong, seekTo, setIsPlaying } = usePlayer();

// //   const getToken = () => localStorage.getItem("access_token");

// //   const cleanup = useCallback(() => {
// //     if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
// //     if (socketRef.current) {
// //       socketRef.current.onopen = null;
// //       socketRef.current.onclose = null;
// //       socketRef.current.onmessage = null;
// //       socketRef.current.onerror = null;
// //       try {
// //         socketRef.current.close(1000, "cleanup");
// //       } catch {}
// //       socketRef.current = null;
// //     }
// //     setConnected(false);
// //   }, []);

// //   const handleMessage = useCallback((event) => {
// //     try {
// //       const data = JSON.parse(event.data);
// //       console.log("[JamSocket] WS message received:", data);

// //       if (data.type === "jam_control") {
// //         console.log("[JamSocket] jam_control action:", data.action);

// //         if (data.action === "play") {
// //           const serverTs = data.server_timestamp || Date.now();
// //           const latencyMs = Date.now() - serverTs;
// //           const adjustedPos = (data.position || 0) + latencyMs / 1000;

// //           console.log("[JamSocket] Playing track from jam_control, video_id:", data.track_id);
// //           console.log(`[JamSocket] Latency: ${latencyMs}ms, seeking to: ${adjustedPos.toFixed(2)}s`);

// //           playSong({
// //             yt_video_id: data.track_id,
// //             title: data.track_title,
// //             artist_name: data.track_artist,
// //           });

// //           setTimeout(() => {
// //             seekTo(adjustedPos);
// //           }, 150);

// //           setIsPlaying(true);
// //         }
// //         else if (data.action === "pause") {
// //           // Implement pause if desired
// //           setIsPlaying(false);
// //         }
// //         else if (data.action === "seek") {
// //           seekTo(data.position || 0);
// //         }
// //         else if (data.action === "skip") {
// //           playSong({
// //             yt_video_id: data.track_id,
// //             title: data.track_title,
// //             artist_name: data.track_artist,
// //           });
// //         }
// //       }

// //       // handle other message types if needed

// //     } catch (err) {
// //       console.error("[JamSocket] Error parsing WS message", err);
// //     }
// //   }, [playSong, seekTo, setIsPlaying]);

// //   const connect = useCallback(() => {
// //     const token = getToken();
// //     if (!token) {
// //       console.error("❌ No token for Jam socket");
// //       return;
// //     }

// //     cleanup();
// //     const url = `${import.meta.env.VITE_WS_BASE || "ws://127.0.0.1:8000"}/ws/jam/${roomId}/?token=${token}`;
// //     const ws = new WebSocket(url);
// //     socketRef.current = ws;

// //     ws.onopen = () => {
// //       console.log("✅ Jam socket connected");
// //       setConnected(true);
// //       reconnectRef.current = 0;
// //     };

// //     ws.onclose = (e) => {
// //       console.log("❌ Jam socket closed", e.code, e.reason);
// //       setConnected(false);

// //       if (e.code === 403) {
// //         console.error("⚠️ Token expired, please refresh");
// //         // handle token refresh if needed
// //       }

// //       if (reconnectRef.current < 5) {
// //         const timeout = 1000 * 2 ** reconnectRef.current;
// //         reconnectRef.current++;
// //         reconnectTimeoutRef.current = setTimeout(connect, timeout);
// //       }
// //     };

// //     ws.onerror = (err) => {
// //       console.error("⚠️ Jam socket error", err);
// //       ws.close();
// //     };

// //     ws.onmessage = handleMessage; // set message handler here
// //   }, [roomId, cleanup, handleMessage]);

// //   useEffect(() => {
// //     if (roomId) connect();
// //     return () => cleanup();
// //   }, [roomId, connect, cleanup]);

// //   const send = useCallback((payload) => {
// //     if (socketRef.current?.readyState === WebSocket.OPEN) {
// //       socketRef.current.send(JSON.stringify(payload));
// //       console.log("[JamSocket] WS message sent:", payload);
// //       return true;
// //     }
// //     return false;
// //   }, []);

// //   return { connected, send };
// // }



// // // src/hooks/useJamSocket.js
// // import { useEffect, useRef, useState, useCallback } from "react";
// // import { usePlayer } from "../contexts/PlayerContext";

// // export default function useJamSocket(roomId) {
// //   const [connected, setConnected] = useState(false);
// //   const socketRef = useRef(null);
// //   const reconnectAttemptRef = useRef(0);
// //   const reconnectTimeoutRef = useRef(null);

// //   const { playSong, seekTo, setIsPlaying } = usePlayer();

// //   const getToken = () => localStorage.getItem("access_token");

// //   // Cleanup function to close WS properly
// //   const cleanup = useCallback(() => {
// //     if (reconnectTimeoutRef.current) {
// //       clearTimeout(reconnectTimeoutRef.current);
// //       reconnectTimeoutRef.current = null;
// //     }
// //     if (socketRef.current) {
// //       try {
// //         socketRef.current.onopen = null;
// //         socketRef.current.onerror = null;
// //         socketRef.current.onmessage = null;
// //         socketRef.current.onclose = null;
// //         socketRef.current.close(1000, "cleanup");
// //       } catch (e) {
// //         // ignore close errors
// //       }
// //       socketRef.current = null;
// //     }
// //     setConnected(false);
// //   }, []);

// //   const handleMessage = useCallback(
// //     (event) => {
// //       try {
// //         const data = JSON.parse(event.data);
// //         console.log("[JamSocket] WS message received:", data);

// //         if (data.type === "jam_control") {
// //           console.log("[JamSocket] jam_control action:", data.action);

// //           if (data.action === "play") {
// //             const serverTs = data.server_timestamp || Date.now();
// //             const latencyMs = Date.now() - serverTs;
// //             const adjustedPos = (data.position || 0) + latencyMs / 1000;

// //             console.log("[JamSocket] Playing track from jam_control, video_id:", data.track_id);
// //             console.log(`[JamSocket] Latency: ${latencyMs}ms, seeking to: ${adjustedPos.toFixed(2)}s`);

// //             playSong({
// //               yt_video_id: data.track_id,
// //               title: data.track_title,
// //               artist_name: data.track_artist,
// //             });

// //             setTimeout(() => {
// //               seekTo(adjustedPos);
// //             }, 150);

// //             setIsPlaying(true);
// //           } else if (data.action === "pause") {
// //             setIsPlaying(false);
// //           } else if (data.action === "seek") {
// //             seekTo(data.position || 0);
// //           } else if (data.action === "skip") {
// //             playSong({
// //               yt_video_id: data.track_id,
// //               title: data.track_title,
// //               artist_name: data.track_artist,
// //             });
// //           }
// //         }
// //       } catch (err) {
// //         console.error("[JamSocket] Error parsing WS message", err);
// //       }
// //     },
// //     [playSong, seekTo, setIsPlaying]
// //   );

// //   const connect = useCallback(() => {
// //     const token = getToken();
// //     if (!token) {
// //       console.error("❌ No token for Jam socket, aborting connect");
// //       return;
// //     }
// //     if (!roomId) {
// //       console.warn("⚠️ No roomId provided for Jam socket, aborting connect");
// //       return;
// //     }

// //     cleanup();

// //     const url = `${import.meta.env.VITE_WS_BASE || "ws://127.0.0.1:8000"}/ws/jam/${roomId}/?token=${token}`;
// //     console.log("[JamSocket] Connecting to", url);

// //     const ws = new WebSocket(url);
// //     socketRef.current = ws;

// //     ws.onopen = () => {
// //       console.log("✅ Jam socket connected");
// //       setConnected(true);
// //       reconnectAttemptRef.current = 0;
// //     };

// //     ws.onclose = (e) => {
// //       console.warn("❌ Jam socket closed", e.code, e.reason);
// //       setConnected(false);

// //       if (e.code === 403) {
// //         console.error("⚠️ Token expired or unauthorized - please refresh token");
// //         // Optionally trigger logout or token refresh here
// //         return; // do not reconnect with invalid token
// //       }

// //       // Exponential backoff reconnect with maximum attempts
// //       if (reconnectAttemptRef.current < 5) {
// //         const delay = 1000 * 2 ** reconnectAttemptRef.current;
// //         reconnectAttemptRef.current += 1;
// //         reconnectTimeoutRef.current = setTimeout(connect, delay);
// //         console.log(`[JamSocket] Reconnecting in ${delay} ms`);
// //       } else {
// //         console.error("[JamSocket] Max reconnect attempts reached");
// //       }
// //     };

// //     ws.onerror = (err) => {
// //       console.error("⚠️ Jam socket encountered error", err);
// //       ws.close();
// //     };

// //     ws.onmessage = handleMessage;
// //   }, [roomId, cleanup, handleMessage]);

// //   useEffect(() => {
// //     if (roomId) {
// //       connect();
// //     }

// //     return () => {
// //       cleanup();
// //     };
// //   }, [roomId, connect, cleanup]);

// //   const send = useCallback(
// //     (payload) => {
// //       if (socketRef.current?.readyState === WebSocket.OPEN) {
// //         socketRef.current.send(JSON.stringify(payload));
// //         console.log("[JamSocket] WS message sent:", payload);
// //         return true;
// //       } else {
// //         console.warn("[JamSocket] WS not open, message not sent:", payload);
// //         return false;
// //       }
// //     },
// //     []
// //   );

// //   return { connected, send };
// // }



// // src/hooks/useJamSocket.js
// import { useEffect, useRef, useState, useCallback } from "react";
// import { usePlayer } from "../contexts/PlayerContext";

// export default function useJamSocket(roomId) {
//   const [connected, setConnected] = useState(false);
//   const [lastMessage, setLastMessage] = useState(null);
//   const socketRef = useRef(null);
//   const reconnectAttemptRef = useRef(0);
//   const reconnectTimeoutRef = useRef(null);

//   const { playSong, seekTo, setIsPlaying } = usePlayer();

//   const getToken = () => localStorage.getItem("access_token");

//   // Cleanup function to close WS properly
//   const cleanup = useCallback(() => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//     if (socketRef.current) {
//       try {
//         socketRef.current.onopen = null;
//         socketRef.current.onerror = null;
//         socketRef.current.onmessage = null;
//         socketRef.current.onclose = null;
//         socketRef.current.close(1000, "cleanup");
//       } catch (e) {
//         // ignore close errors
//       }
//       socketRef.current = null;
//     }
//     setConnected(false);
//   }, []);

//   const handleMessage = useCallback(
//     (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log("[JamSocket] WS message received:", data);
//         setLastMessage(data);

//         if (data.type === "jam_control") {
//           console.log("[JamSocket] jam_control action:", data.action);

//           if (data.action === "play") {
//             const serverTs = data.server_timestamp || Date.now();
//             const latencyMs = Date.now() - serverTs;
//             const adjustedPos = (data.position || 0) + latencyMs / 1000;

//             console.log("[JamSocket] Playing track from jam_control, video_id:", data.track_id);
//             console.log(`[JamSocket] Latency: ${latencyMs}ms, seeking to: ${adjustedPos.toFixed(2)}s`);

//             playSong({
//               yt_video_id: data.track_id,
//               title: data.track_title,
//               artist_name: data.track_artist,
//             });

//             setTimeout(() => {
//               seekTo(adjustedPos);
//             }, 150);

//             setIsPlaying(true);
//           } else if (data.action === "pause") {
//             setIsPlaying(false);
//           } else if (data.action === "seek") {
//             seekTo(data.position || 0);
//           } else if (data.action === "skip") {
//             playSong({
//               yt_video_id: data.track_id,
//               title: data.track_title,
//               artist_name: data.track_artist,
//             });
//           }
//         }
//       } catch (err) {
//         console.error("[JamSocket] Error parsing WS message", err);
//       }
//     },
//     [playSong, seekTo, setIsPlaying]
//   );

//   const connect = useCallback(() => {
//     const token = getToken();
//     if (!token) {
//       console.error("❌ No token for Jam socket, aborting connect");
//       return;
//     }
//     if (!roomId) {
//       console.warn("⚠️ No roomId provided for Jam socket, aborting connect");
//       return;
//     }

//     cleanup();

//     const url = `${import.meta.env.VITE_WS_BASE || "ws://127.0.0.1:8000"}/ws/jam/${roomId}/?token=${token}`;
//     console.log("[JamSocket] Connecting to", url);

//     const ws = new WebSocket(url);
//     socketRef.current = ws;

//     ws.onopen = () => {
//       console.log("✅ Jam socket connected");
//       setConnected(true);
//       reconnectAttemptRef.current = 0;
//     };

//     ws.onclose = (e) => {
//       console.warn("❌ Jam socket closed", e.code, e.reason);
//       setConnected(false);

//       if (e.code === 403) {
//         console.error("⚠️ Token expired or unauthorized - please refresh token");
//         // Optionally trigger logout or token refresh here
//         return; // do not reconnect with invalid token
//       }

//       // Exponential backoff reconnect with maximum attempts
//       if (reconnectAttemptRef.current < 5) {
//         const delay = 1000 * 2 ** reconnectAttemptRef.current;
//         reconnectAttemptRef.current += 1;
//         reconnectTimeoutRef.current = setTimeout(connect, delay);
//         console.log(`[JamSocket] Reconnecting in ${delay} ms`);
//       } else {
//         console.error("[JamSocket] Max reconnect attempts reached");
//       }
//     };

//     ws.onerror = (err) => {
//       console.error("⚠️ Jam socket encountered error", err);
//       ws.close();
//     };

//     ws.onmessage = handleMessage;
//   }, [roomId, cleanup, handleMessage]);

//   useEffect(() => {
//     if (roomId) {
//       connect();
//     }

//     return () => {
//       cleanup();
//     };
//   }, [roomId, connect, cleanup]);

//   const send = useCallback(
//     (payload) => {
//       if (socketRef.current?.readyState === WebSocket.OPEN) {
//         socketRef.current.send(JSON.stringify(payload));
//         console.log("[JamSocket] WS message sent:", payload);
//         return true;
//       } else {
//         console.warn("[JamSocket] WS not open, message not sent:", payload);
//         return false;
//       }
//     },
//     []
//   );

//   return { connected, send, lastMessage };
// }

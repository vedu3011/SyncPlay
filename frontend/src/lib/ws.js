
// export function chatSocketUrl(fid) {
//   const base = import.meta.env.VITE_WS_BASE || "ws://localhost:8000";
//   return `${base}/ws/chat/${fid}/`;
// }


// src/lib/ws.js
// export function chatSocketUrl(fid) {
//   const base = import.meta.env.VITE_WS_BASE || "ws://localhost:8000";
//   const token = localStorage.getItem("access_token");
//   return token
//     ? `${base}/ws/chat/${fid}/?token=${token}`
//     : `${base}/ws/chat/${fid}/`;
// }


// // src/lib/ws.js
export function chatSocketUrl(fid) {
  const base = import.meta.env.VITE_WS_BASE || "ws://localhost:8000";
  const token = localStorage.getItem("access_token");
  return token
    ? `${base}/ws/chat/${fid}/?token=${token}`
    : `${base}/ws/chat/${fid}/`;
}

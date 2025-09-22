// src/lib/api.js
import API from "./axios"; // your configured axios with JWT




export async function registerUser({ username, password, confirm }) {
  const { data } = await API.post("/auth/register/", { username, password, confirm });
  return data;
}

export async function loginUser({ username, password }) {
  const { data } = await API.post("/auth/login/", { username, password });
  // if (data.access) localStorage.setItem("token", data.access);
  // return data;
  if (data.access) localStorage.setItem("access_token", data.access); // Changed from "token" to "access_token"
  return data;
}

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getArtists = async () => {
  const { data } = await API.get("/music/artists?limit=100");
  return data;
};
export const getGenres = async () => {
  const { data } = await API.get("/music/genres");
  return data;
};
export const savePreferences = async ({ artist_ids, genre_ids }) => {
  const { data } = await API.post("/users/me/preferences/", { artist_ids, genre_ids });
  return data;
};
export const getPreferences = async () => {
  const { data } = await API.get("/users/me/preferences/");
  return data;
};
export async function getHomeSummary() {
  const { data } = await API.get("/music/home/summary/");
  return data;
}
export async function recordPlayed(payload) {
  const { data } = await API.post("/music/music/played/", payload);
  return data;
}

export async function getPlaylistDetail(id) {
  const res = await API.get(`/music/playlist/${id}/`);
  // // Log the response to debug
  // console.log("Raw API response:", res.data);
  // If your backend is still wrapping the data in a "data" property:
  if (res.data && res.data.data) {
    return res.data.data; // Return the nested data
  }
  // Otherwise return the data directly
  return res.data;
}




export async function getArtistDetail(id) {
  const { data } = await API.get(`/music/artist/${id}/`);
  // console.log("Raw API response:", data);
  if (data && data.data) {
    return data.data; // Return the nested data
  }
  // Otherwise return the data directly
  return data;
}

export async function getSearchResults(query, limit = 10) {
  const { data } = await API.get(`/music/search/`, {
    params: { q: query, limit }
  });
  return data;
}

export const getMyPlaylists = async () => {
  const { data } = await API.get("/music/my-playlists/");
  return data;
};

export const createPlaylist = async (name) => {
  const { data } = await API.post("/music/my-playlists/", { name });
  return data;
};

export const getCustomPlaylistDetail = async (id) => {
  const { data } = await API.get(`/music/my-playlists/${id}/`);
  return data;
};

export const addTrackToPlaylist = async (playlistId, track) => {
  const { data } = await API.post(`/music/my-playlists/${playlistId}/add-track/`, track);
  return data;
};

export const removeTrackFromPlaylist = async (playlistId, videoId) => {
  const { data } = await API.delete(`/music/my-playlists/${playlistId}/tracks/${videoId}/`);
  return data;
};

export const toggleFavourite = async (track) => {
  const { data } = await API.post(`/music/favourites/toggle/`, track);
  return data; // { favourited: true/false }
};
// ---- Social
export const searchUsers = async (q) => {
  const { data } = await API.get(`/social/users/search/?q=${encodeURIComponent(q)}`);
  return data;
};
export const sendFriendRequest = async (receiver_id) => {
  const { data } = await API.post(`/social/requests/send/`, { receiver_id });
  return data;
};
export const listRequests = async () => {
  const { data } = await API.get(`/social/requests/`);
  return data;
};
export const respondRequest = async (id, action) => {
  const { data } = await API.post(`/social/requests/${id}/respond/`, { action });
  return data;
};
export const listFriends = async (tab="all") => {
  const { data } = await API.get(`/social/friends/?tab=${tab}`);
  return data;
};
export const getFriendshipSecret = async (fid) => {
  const { data } = await API.get(`/social/friends/${fid}/secret/`);
  return data.secret_b64;
};

// ---- Chat
export const getHistory = async (fid) => {
  const { data } = await API.get(`/chat/history/${fid}/`);
  return data;
};

// --- append to src/lib/api.js ---

// Playlists (collaborative)
export const createCollaborativePlaylist = async (friendshipId, name="Shared Playlist") => {
  const { data } = await API.post(`/jam/playlists/create_shared/${friendshipId}/`, { name });
  return data;
};

export const listFriendshipPlaylists = async (friendshipId) => {
  const { data } = await API.get(`/jam/playlists/by_friendship/${friendshipId}/`);
  return data;
};

export const addTrackToPlaylistApi = async (playlistId, track) => {
  const { data } = await API.post(`/jam/playlists/${playlistId}/add_track/`, track);
  return data;
};

export const removeTrackFromPlaylistApi = async (playlistId, videoId) => {
  const { data } = await API.delete(`/jam/playlists/${playlistId}/tracks/${videoId}/`);
  return data;
};

export const savePlaylistAsPersonalApi = async (playlistId) => {
  const { data } = await API.post(`/jam/playlists/${playlistId}/save_as_personal/`);
  return data;
};


// Rooms
export const createRoom = async ({ name, is_private }) => {
  const { data } = await API.post(`/jam/rooms/create/`, { name, is_private });
  return data;
};

export const listMyRooms = async () => {
  const { data } = await API.get(`/jam/rooms/mine/`);
  return data; // { public: [...], private: [...] }
};

export const searchPublicRooms = async (q = "") => {
  const { data } = await API.get(`/jam/rooms/public/`, { params: { q } });
  return data; // []
};

export const joinRoomByCode = async (code) => {
  const { data } = await API.post(`/jam/rooms/join/`, { code });
  return data;
};

export const getRoomDetail = async (roomId) => {
  const { data } = await API.get(`/jam/rooms/${roomId}/`);
  return data; // RoomDetail
};

export const addSuggestion = async (roomId, track) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/suggestions/`, track);
  return data;
};

export const approveSuggestion = async (roomId, sid) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/suggestions/${sid}/approve/`);
  return data;
};

export const addToRoomQueue = async (roomId, track) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/queue/`, track);
  return data;
};

export const removeFromRoomQueue = async (roomId, yt_video_id) => {
  const { data } = await API.delete(`/jam/rooms/${roomId}/queue/`, { params: { yt_video_id } });
  return data;
};

export const saveRoomQueueAsPersonal = async (roomId) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/save_as_personal/`);
  return data;
};

export const promoteToEditor = async (roomId, userId) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/members/${userId}/promote/`);
  return data;
};

export const kickMember = async (roomId, userId) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/members/${userId}/kick/`);
  return data;
};
export const transferHost = async (roomId, userId) => {
  const { data } = await API.post(`/jam/rooms/${roomId}/members/${userId}/transfer_host/`);
  return data;
};


export default API;
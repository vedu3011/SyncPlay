// src/lib/api.js
import axios from "axios";



const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api",
});

export async function registerUser({ username, password, confirm }) {
  const { data } = await API.post("/auth/register/", { username, password, confirm });
  return data;
}

export async function loginUser({ username, password }) {
  const { data } = await API.post("/auth/login/", { username, password });
  if (data.access) localStorage.setItem("token", data.access);
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

export default API;



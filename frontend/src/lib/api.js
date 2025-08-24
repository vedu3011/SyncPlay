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



// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000/api", // change to hosted backend later
// });

// // Attach token for protected routes
// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem("accessToken");
//   if (token) req.headers.Authorization = `Bearer ${token}`;
//   return req;
// });

export default API;

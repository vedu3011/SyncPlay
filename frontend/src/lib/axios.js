// src/lib/axios.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Request interceptor → attach token if exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → auto-refresh token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const { data } = await axios.post(`${API_BASE}/auth/jwt/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;
        localStorage.setItem("access_token", newAccessToken);

        API.defaults.headers.Authorization = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);

        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/signin"; // redirect to login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default API;

// export const markMessagesAsRead = async (fid) => {
//   const token = localStorage.getItem("access_token");
//   const response = await fetch(`${API_BASE}/api/chat/${fid}/read`, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${token}`,
//       "Content-Type": "application/json"
//     }
//   });
  
//   if (!response.ok) {
//     throw new Error(`Failed to mark messages as read: ${response.statusText}`);
//   }
  
//   return await response.json();
// };

// // Get unread message counts
// export const getUnreadCounts = async () => {
//   const token = localStorage.getItem("access_token");
//   const response = await fetch(`${API_BASE}/api/chat/unread-counts`, {
//     headers: {
//       "Authorization": `Bearer ${token}`
//     }
//   });
  
//   if (!response.ok) {
//     throw new Error(`Failed to get unread counts: ${response.statusText}`);
//   }
  
//   return await response.json();
// };

// // Get online users
// export const getOnlineUsers = async () => {
//   const token = localStorage.getItem("access_token");
//   const response = await fetch(`${API_BASE}/api/users/online`, {
//     headers: {
//       "Authorization": `Bearer ${token}`
//     }
//   });
  
//   if (!response.ok) {
//     throw new Error(`Failed to get online users: ${response.statusText}`);
//   }
  
//   return await response.json();
// };

// // Update user status
// export const updateUserStatus = async (status = 'online') => {
//   const token = localStorage.getItem("access_token");
//   const response = await fetch(`${API_BASE}/api/users/status`, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${token}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ status })
//   });
  
//   if (!response.ok) {
//     throw new Error(`Failed to update status: ${response.statusText}`);
//   }
  
//   return await response.json();
// };

// // Get user profile picture URL
// export const getUserProfilePicture = async (userId) => {
//   const token = localStorage.getItem("access_token");
//   const response = await fetch(`${API_BASE}/api/users/${userId}/profile-picture`, {
//     headers: {
//       "Authorization": `Bearer ${token}`
//     }
//   });
  
//   if (!response.ok) {
//     return null; // Return null if no profile picture
//   }
  
//   const data = await response.json();
//   return data.profile_picture_url;
// };

// // Upload profile picture
// export const uploadProfilePicture = async (file) => {
//   const token = localStorage.getItem("access_token");
//   const formData = new FormData();
//   formData.append('profile_picture', file);
  
//   const response = await fetch(`${API_BASE}/api/users/profile-picture`, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${token}`
//     },
//     body: formData
//   });
  
//   if (!response.ok) {
//     throw new Error(`Failed to upload profile picture: ${response.statusText}`);
//   }
  
//   return await response.json();
// };
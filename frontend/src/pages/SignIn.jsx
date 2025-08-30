// src/pages/SignIn.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../lib/api";
import {  getPreferences } from "../lib/api";


export default function SignIn() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


const submit = async (e) => {
  e.preventDefault();
  setErr(""); 
  setLoading(true);
  
  try {
    // console.log("🔍 Attempting login with:", form);
    
    const data = await loginUser(form);
    
    console.log("✅ Login success");
    // console.log("🎫 Access token:", data.access);
    // console.log("🔄 Refresh token:", data.refresh);
    // console.log("👤 User data:", data.user);
    // console.log("🔍 Type of data.user:", typeof data.user);
    
    // ✅ Add safety check
    if (data.user && data.user.username) {
      localStorage.setItem("username", data.user.username);
      console.log("✅ Username saved:", data.user.username);
    } else {
      console.log("❌ No user data received");
    }
    const preferences = await getPreferences();

    const hasPreferences =
      (preferences.preferred_artists && preferences.preferred_artists.length > 0) ||
      (preferences.preferred_genres && preferences.preferred_genres.length > 0);
    
    if (hasPreferences) {
      nav("/home");      // user has preferences, skip preferences page
    } else {
      nav("/artists");  // no preferences yet, show preferences page
    }
    // nav("/artists");
    
  } catch (e) {
    console.error("❌ Login failed:", e);
    setErr(e?.response?.data?.error || "Invalid credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white px-6 py-10 flex flex-col">
      <div className="mx-auto mt-6 mb-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-2xl font-bold">S</div>
      <h1 className="text-center text-2xl font-bold mb-8">Sign In</h1>

      <form onSubmit={submit} className="space-y-4 max-w-md mx-auto w-full">
        <input
          name="username" placeholder="Enter Username" value={form.username} onChange={onChange}
          className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
        />
        <input
          name="password" type="password" placeholder="Enter Password" value={form.password} onChange={onChange}
          className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
        />

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-pink-400">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

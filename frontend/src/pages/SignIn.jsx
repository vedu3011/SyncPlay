// src/pages/SignIn.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../lib/api";
import { FaRegUser } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { BsEye, BsEyeSlash } from "react-icons/bs";
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

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white px-6 py-10 flex flex-col items-center gap-[48px] overflow-hidden relative">
      {/* Top curved background */}
      <div className="flex justify-center items-center flex-1 flex-col half-oval-bottom mb-[10px] bg-[#0E1516] relative top-0"> 

        <img
          src="../assets/syncplay_logo.png"
          alt="logo"
          className="w-[44px] h-[62px] object-contain flex justify-center relative z-10"
        />
      <h1 className="text-center text-[26px] font-extrabold ">Sign In!</h1>
      </div>

      <form onSubmit={submit} className="w-[256px] flex flex-col gap-[18px] mb-[90px]">
        <div>
          <div className="w-full flex gap-[8px] items-baseline">
          <FaRegUser />
          <input
          name="username" placeholder="Enter Username" value={form.username} onChange={onChange}
          className="w-full bg-transparent px-4 py-3 focus:outline-none focus:border-pink-500"
          />
          </div>
          <div className="w-full h-[1px] bg-[#ffffff]"></div>
        </div>
        
        <div>
          <div className="w-full flex gap-[8px] items-baseline">
            <RiLockPasswordLine />
            <input
          name="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" value={form.password} onChange={onChange}
          className="w-full bg-transparent px-4 py-3 focus:outline-none focus:border-pink-500"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="border-none m-[0px] p-[0px] bg-[#010101]">
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
          </div>
          <div className="w-full h-[1px] bg-[#ffffff]"></div>
        </div>
        
        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#DD2476]">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

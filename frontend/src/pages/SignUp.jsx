// src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../lib/api";
import { FaRegUser } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { BsEye, BsEyeSlash } from "react-icons/bs";


export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await registerUser(form);
      nav("/signin");
    } catch (e) {
      setErr(e?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-[#010101] text-white px-6 py-10 flex flex-col items-center gap-[48px] overflow-hidden relative">
      {/* Top curved background */}
      <div className="flex justify-center items-center flex-1 flex-col half-oval-bottom mb-[10px] bg-[#0E1516] relative top-0">
        
        <img
          src="../assets/syncplay_logo.png"
          alt="logo"
          className="w-[44px] h-[62px] object-contain flex justify-center relative z-10"
        />
      <h1 className="text-center text-[26px] font-extrabold ">Sign Up Now!</h1>
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
            <div><RiLockPasswordLine /></div>
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
        
        <div>
          <div className="w-full flex gap-[8px] items-baseline">
            <div><RiLockPasswordLine /></div>
            <input
          name="confirm" type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={form.confirm} onChange={onChange}
          className="w-full bg-transparent px-4 py-3 focus:outline-none focus:border-pink-500"
        />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="border-none m-[0px] p-[0px] bg-[#010101]">
            {showConfirm ? <BsEyeSlash /> : <BsEye />}
          </button>
          </div>
          <div className="w-full h-[1px] bg-[#ffffff]"></div>
        </div>
        

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-400 mb-auto">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#DD2476]">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

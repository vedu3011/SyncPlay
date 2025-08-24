// src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../lib/api";

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

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white px-6 py-10 flex flex-col">
      <div className="mx-auto mt-6 mb-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-2xl font-bold">S</div>
      <h1 className="text-center text-2xl font-bold mb-8">Sign Up Now!</h1>

      <form onSubmit={submit} className="space-y-4 max-w-md mx-auto w-full">
        <input
          name="username" placeholder="Enter Username" value={form.username} onChange={onChange}
          className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
        />
        <input
          name="password" type="password" placeholder="Enter Password" value={form.password} onChange={onChange}
          className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
        />
        <input
          name="confirm" type="password" placeholder="Confirm Password" value={form.confirm} onChange={onChange}
          className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
        />

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-pink-400">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

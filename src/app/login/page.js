"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { X } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    }

    setLoading(false);
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-10"
      >
        <Link
          href="/shop"
          className="absolute left-5 top-5 rounded-full border border-white/20 p-2 text-white/70 hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </Link>
        <h1 className="font-display text-2xl tracking-[0.2em]">Login</h1>
        <p className="mt-2 text-sm text-white/60">
          Access your account and order history.
        </p>

        <label className="mt-8 block text-xs uppercase tracking-[0.3em] text-white/60">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
        />

        <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
        />

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="glow-button mt-8 w-full rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
        >
          {loading ? "Logging in" : "Log In"}
        </button>

        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
          <Link href="/signup" className="hover:text-white">
            Create Account
          </Link>
          <Link href="/admin-login" className="hover:text-white">
            Login as Admin
          </Link>
        </div>
      </form>
    </div>
  );
}


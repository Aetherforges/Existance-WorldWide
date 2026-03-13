"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/verify` },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Check your email for the OTP verification link or code.");
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-10"
      >
        <h1 className="font-display text-2xl tracking-[0.2em]">Sign Up</h1>
        <p className="mt-2 text-sm text-white/60">
          Create your account and verify via OTP.
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

        <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
          Confirm Password
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
        />

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}

        <button
          type="submit"
          className="glow-button mt-8 w-full rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
        >
          Create Account
        </button>

        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
          <Link href="/login" className="hover:text-white">
            Back to Login
          </Link>
          <Link href="/verify" className="hover:text-white">
            Verify OTP
          </Link>
        </div>
      </form>
    </div>
  );
}

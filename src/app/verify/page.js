"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setMessage("Email verified. You can now log in.");
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-10"
      >
        <h1 className="font-display text-2xl tracking-[0.2em]">Verify OTP</h1>
        <p className="mt-2 text-sm text-white/60">
          Enter the OTP code from your email.
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
          OTP Code
        </label>
        <input
          required
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
        />

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}

        <button
          type="submit"
          className="glow-button mt-8 w-full rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
        >
          Verify
        </button>
      </form>
    </div>
  );
}

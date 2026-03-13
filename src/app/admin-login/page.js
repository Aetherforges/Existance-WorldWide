"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data?.message ?? "Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-10"
      >
        <Link
          href="/shop"
          className="absolute left-5 top-5 rounded-full border border-white/20 p-2 text-white/70 hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </Link>
        <h1 className="font-display text-2xl tracking-[0.2em]">Admin Login</h1>
        <p className="mt-2 text-sm text-white/60">
          Secure access for EXIST WORLD WIDE operations.
        </p>

        <label className="mt-8 block text-xs uppercase tracking-[0.3em] text-white/60">
          Username
        </label>
        <input
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
          {loading ? "Authenticating" : "Login"}
        </button>
      </form>
    </div>
  );
}


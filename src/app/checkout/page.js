"use client";

import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";
import { formatCurrency } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";

const deliveryOptions = ["J&T", "Lalamove", "Pickup"];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    delivery: deliveryOptions[0],
    email: user?.email ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const receiptText = useMemo(() => {
    const lines = [
      "EXIST WORLD WIDE - RECEIPT",
      `Name: ${form.name || "-"}`,
      `Phone Number: ${form.phone || "-"}`,
      `Shipping Address: ${form.address || "-"}`,
      `Delivery Option: ${form.delivery || "-"}`,
      "Items:",
      ...items.map(
        (item) =>
          `- ${item.name} | Qty ${item.quantity} | ${formatCurrency(
            item.price * item.quantity
          )}`
      ),
      `Total: ${formatCurrency(total)}`,
    ];
    return lines.join("\n");
  }, [form.name, form.phone, form.address, items, total]);

  async function handleCopyReceipt() {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!items.length) {
      setError("Your cart is empty.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { email: form.email },
          order: {
            total,
            status: "Pending",
            delivery_method: form.delivery,
            shipping_name: form.name,
            phone: form.phone,
            address: form.address,
          },
          items,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.message ?? "Checkout failed.");
      }

      clearCart();
      setMessage("Order placed successfully.");
    } catch (err) {
      setError("Unable to place order. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="page-shell">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-[#111111] p-8"
        >
          <h1 className="font-display text-2xl tracking-[0.2em]">Checkout</h1>
          <p className="mt-2 text-sm text-white/60">
            Provide delivery details to confirm your order.
          </p>

          <label className="mt-8 block text-xs uppercase tracking-[0.3em] text-white/60">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Phone Number
          </label>
          <input
            required
            value={form.phone}
            onChange={handleChange("phone")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Address
          </label>
          <textarea
            required
            rows="3"
            value={form.address}
            onChange={handleChange("address")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Delivery Option
          </label>
          <select
            value={form.delivery}
            onChange={handleChange("delivery")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          >
            {deliveryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Email (for order history)
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="glow-button mt-8 w-full rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          >
            {loading ? "Placing order" : "Place Order"}
          </button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">Order Summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em]">{item.name}</p>
                  <p className="text-xs text-white/50">Qty {item.quantity}</p>
                </div>
                <p className="text-sm">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Receipt</p>
            <pre className="mt-4 whitespace-pre-wrap text-xs text-white/70">
              {receiptText}
            </pre>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyReceipt}
                className="glow-button rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href="https://www.facebook.com/profile.php?id=61582430759387"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/30 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
              >
                Send to Facebook Manually
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { formatCurrency } from "../../lib/format";

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError("Please enter your order number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/order/tracking?orderNumber=${encodeURIComponent(trimmed)}`
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Order not found.");
      }
      setResult(payload.order);
    } catch (err) {
      setError(err?.message || "Unable to find order.");
    }
    setLoading(false);
  }

  return (
    <div className="page-shell">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Order Tracking
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.2em]">
            Track Your Order
          </h1>
          <p className="mt-3 text-sm text-white/60">
            Enter your order number to view the latest status and tracking details.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="Enter order number"
              className="flex-1 rounded-full bg-black px-4 py-3 text-sm text-white ring-1 ring-white/10 focus:ring-white/40"
            />
            <button
              type="submit"
              className="glow-button rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
              disabled={loading}
            >
              {loading ? "Searching" : "Search"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        {result && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-8">
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
              Tracking Result
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="space-y-2 text-sm text-white/70">
                <p>
                  Order Number:{" "}
                  <span className="text-white">
                    {result.order_number || result.id}
                  </span>
                </p>
                <p>
                  Status: <span className="text-white">{result.status}</span>
                </p>
                <p>
                  Delivery Method:{" "}
                  <span className="text-white">
                    {result.delivery_method || "-"}
                  </span>
                </p>
                <p>
                  Tracking Number:{" "}
                  <span className="text-white">
                    {result.tracking_number || "-"}
                  </span>
                </p>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p>
                  Name:{" "}
                  <span className="text-white">{result.shipping_name || "-"}</span>
                </p>
                <p>
                  Phone: <span className="text-white">{result.phone || "-"}</span>
                </p>
                <p>
                  Address:{" "}
                  <span className="text-white">{result.address || "-"}</span>
                </p>
                <p>
                  Total:{" "}
                  <span className="text-white">{formatCurrency(result.total)}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Items Ordered
              </p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                {(result.order_items ?? []).map((item, index) => (
                  <p key={`${result.id}-${index}`}>
                    {item.product_name || item.products?.name || "Item"} x
                    {item.quantity}
                    {typeof item.price === "number" && (
                      <span className="text-white/60">
                        {" "}
                        · {formatCurrency(item.price)}
                      </span>
                    )}
                  </p>
                ))}
                {(result.order_items ?? []).length === 0 && (
                  <p className="text-white/50">No items recorded.</p>
                )}
              </div>
            </div>

            {result.tracking_number?.trim() && (
              <div className="mt-5">
                <a
                  href={`https://www.17track.net/en/track?nums=${encodeURIComponent(
                    result.tracking_number
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/30 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white"
                >
                  Track Package
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

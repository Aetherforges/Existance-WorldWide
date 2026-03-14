"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../lib/format";
import { calculateTierPrice } from "../../lib/pricing";
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
  const [orderSummary, setOrderSummary] = useState(null);
  const [showHowToOrder, setShowHowToOrder] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const summaryItems = orderSummary?.items ?? items;
  const summaryTotal = orderSummary?.total ?? total;
  const summaryDelivery = orderSummary?.delivery ?? form.delivery;
  const summaryCustomer = orderSummary?.customer ?? {
    name: form.name,
    phone: form.phone,
    address: form.address,
    email: form.email,
  };

  const receiptText = useMemo(() => {
    const lines = [
      "EXIST WORLD WIDE - RECEIPT",
      `Order Number: ${orderSummary?.orderNumber || "-"}`,
      `Name: ${summaryCustomer.name || "-"}`,
      `Phone Number: ${summaryCustomer.phone || "-"}`,
      `Shipping Address: ${summaryCustomer.address || "-"}`,
      `Delivery Option: ${summaryDelivery || "-"}`,
      "Items:",
      ...summaryItems.map(
        (item) => {
          const unitPrice =
            typeof item.price === "number"
              ? item.price
              : calculateTierPrice(item, item.quantity).price;
          return `- ${item.name} | Qty ${item.quantity} | ${formatCurrency(
            unitPrice * item.quantity
          )}`;
        }
      ),
      `Total: ${formatCurrency(summaryTotal)}`,
    ];
    return lines.join("\n");
  }, [
    orderSummary?.orderNumber,
    summaryCustomer.name,
    summaryCustomer.phone,
    summaryCustomer.address,
    summaryDelivery,
    summaryItems,
    summaryTotal,
  ]);

  const summaryWithPrices = useMemo(
    () =>
      summaryItems.map((item) => {
        const unitPrice =
          typeof item.price === "number"
            ? item.price
            : calculateTierPrice(item, item.quantity).price;
        return { ...item, unitPrice };
      }),
    [summaryItems]
  );

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
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          customer: {
            email: form.email || null,
          },
          shipping: {
            name: form.name,
            phone: form.phone,
            address: form.address,
          },
          delivery_method: form.delivery,
          delivery_option: form.delivery,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to place order.");
      }

      setOrderSummary({
        orderNumber: payload?.order_number,
        items: payload?.summary?.items ?? items,
        total: payload?.summary?.total ?? total,
        delivery: payload?.summary?.delivery_method ?? form.delivery,
        customer: payload?.summary?.customer ?? {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
        },
      });
      clearCart();
      setMessage("Order placed successfully.");
    } catch (err) {
      setError(err?.message || "Unable to place order. Please try again.");
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

          <AnimatePresence>
            {error && (
              <motion.p
                className="mt-4 text-sm text-red-400"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {error}
              </motion.p>
            )}
            {message && (
              <motion.p
                className="mt-4 text-sm text-emerald-300"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="glow-button mt-8 w-full rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          >
            {loading ? "Placing order" : "Place Order"}
          </button>
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/50">
            NOTE: PLEASE KEEP YOUR ORDER NUMBER FOR ORDER TRACKING
          </p>
          <button
            type="button"
            onClick={() => setShowHowToOrder(true)}
            className="mt-4 w-full rounded-full border border-white/30 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
          >
            How to Order
          </button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
            Order Summary
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={orderSummary?.orderNumber || "cart"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="mt-6 space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Order Number
                </p>
                <p className="mt-2 text-lg tracking-[0.2em]">
                  {orderSummary?.orderNumber || "-"}
                </p>
              </div>

              <div className="space-y-4">
                {summaryWithPrices.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em]">
                        {item.name}
                      </p>
                      <p className="text-xs text-white/50">
                        Qty {item.quantity} · {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/60 p-5 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Customer Details
                </p>
                <p className="mt-3">{summaryCustomer.name || "-"}</p>
                <p className="text-white/70">{summaryCustomer.phone || "-"}</p>
                <p className="text-white/70">{summaryCustomer.address || "-"}</p>
                {summaryCustomer.email && (
                  <p className="text-white/60">{summaryCustomer.email}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg">
                <span>Total</span>
                <span>{formatCurrency(summaryTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Delivery Method</span>
                <span>{summaryDelivery}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Receipt
            </p>
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

      <AnimatePresence>
        {showHowToOrder && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHowToOrder(false)}
          >
            <motion.div
              className="modal-panel relative w-[92vw] max-w-lg bg-[#111111]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowHowToOrder(false)}
                className="absolute right-4 top-4 text-white/60 transition hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                How to Order
              </p>
              <ul className="mt-4 max-h-64 list-disc space-y-2 overflow-y-auto pr-2 text-sm text-white/70 scrollbar-elegant">
                <li>Fill out neccessary informations</li>
                <li>Place order to update your order status</li>
                <li>Copy the reciept</li>
                <li>
                  Click on send to Facebook manually for us to validate your order
                </li>
                <li>
                  please be informed that order might be delayed de to longe queue
                  of orders
                </li>
                <li>NOTE: Your patience is greatly appreciated _Admins</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

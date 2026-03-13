"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";
import { formatCurrency } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { createUniqueOrderNumber } from "../../lib/orderNumber";

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
        (item) =>
          `- ${item.name} | Qty ${item.quantity} | ${formatCurrency(
            item.price * item.quantity
          )}`
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
      const placedItems = items.map((item) => ({ ...item }));
      const orderNumber = await createUniqueOrderNumber(supabase);

      let customerId = null;
      if (form.email) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("email", form.email)
          .maybeSingle();

        if (existing?.id) {
          customerId = existing.id;
        } else {
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({ email: form.email })
            .select("id")
            .single();
          customerId = newCustomer?.id;
        }
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          total,
          order_number: orderNumber,
          status: "Pending",
          delivery_method: form.delivery,
          shipping_name: form.name,
          phone: form.phone,
          address: form.address,
        })
        .select("id,order_number")
        .single();

      let createdOrder = order;
      if (orderError) {
        if (orderError.code === "23505") {
          const retryNumber = await createUniqueOrderNumber(supabase);
          const { data: retryOrder, error: retryError } = await supabase
            .from("orders")
            .insert({
              customer_id: customerId,
              total,
              order_number: retryNumber,
              status: "Pending",
              delivery_method: form.delivery,
              shipping_name: form.name,
              phone: form.phone,
              address: form.address,
            })
            .select("id,order_number")
            .single();
          if (retryError) throw retryError;
          createdOrder = retryOrder;
        } else {
          throw orderError;
        }
      }

      if (createdOrder?.id) {
        const orderItems = items.map((item) => ({
          order_id: createdOrder.id,
          product_id: item.id,
          quantity: item.quantity,
        }));
        await supabase.from("order_items").insert(orderItems);

        const { data: stockRows } = await supabase
          .from("products")
          .select("id,stock")
          .in(
            "id",
            items.map((item) => item.id)
          );
        const stockMap = new Map(
          (stockRows ?? []).map((row) => [row.id, row.stock ?? 0])
        );

        await Promise.all(
          items.map((item) => {
            const currentStock =
              stockMap.get(item.id) ?? (item.stock ?? 0);
            return supabase
              .from("products")
              .update({
                stock: Math.max(0, currentStock - item.quantity),
              })
              .eq("id", item.id);
          })
        );
      }

      setOrderSummary({
        orderNumber: createdOrder?.order_number ?? orderNumber,
        items: placedItems,
        total,
        delivery: form.delivery,
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
        },
      });
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
                {summaryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em]">
                        {item.name}
                      </p>
                      <p className="text-xs text-white/50">
                        Qty {item.quantity} · {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="text-sm">
                      {formatCurrency(item.price * item.quantity)}
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
    </div>
  );
}

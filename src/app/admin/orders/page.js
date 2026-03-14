"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { formatCurrency } from "../../../lib/format";

const statuses = [
  "Ordered",
  "Pending",
  "Preparing",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackingFilter, setTrackingFilter] = useState("All");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [trackingDraft, setTrackingDraft] = useState("");
  const [trackingMessage, setTrackingMessage] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [trackingSaving, setTrackingSaving] = useState(false);

  async function fetchOrders() {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(
        "id,order_number,total,status,delivery_method,tracking_number,created_at,customer_id,shipping_name,phone,address,customers(email),order_items(quantity,product_name,price,products(name))"
      )
      .order("created_at", { ascending: false });
    if (fetchError) {
      setOrders([]);
      setError(fetchError.message || "Unable to load orders.");
      return;
    }
    setOrders(data ?? []);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusFiltered =
    statusFilter === "All"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const filteredOrders =
    trackingFilter === "All"
      ? statusFiltered
      : statusFiltered.filter((order) => {
          const hasTracking = Boolean(order.tracking_number?.trim());
          return trackingFilter === "Has Tracking" ? hasTracking : !hasTracking;
        });

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  useEffect(() => {
    if (!selectedOrderId) return;
    const current = orders.find((order) => order.id === selectedOrderId);
    if (!current) {
      setSelectedOrderId("");
      return;
    }
    setTrackingDraft(current.tracking_number ?? "");
  }, [orders, selectedOrderId]);

  async function handleStatusChange(orderId, status) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await fetchOrders();
  }

  async function handleSaveTracking() {
    setTrackingError("");
    setTrackingMessage("");
    if (!selectedOrder) return;
    const trimmed = trackingDraft.trim();
    if (!trimmed) {
      setTrackingError("Please enter a tracking number.");
      return;
    }
    setTrackingSaving(true);
    const { error: updateError } = await supabase
      .from("orders")
      .update({ tracking_number: trimmed })
      .eq("id", selectedOrder.id);
    if (updateError) {
      setTrackingError(updateError.message || "Unable to save tracking number.");
      setTrackingSaving(false);
      return;
    }
    await fetchOrders();
    setTrackingMessage("Tracking number saved.");
    setTrackingSaving(false);
  }

  async function handleCancel(orderId) {
    const target = orders.find((order) => order.id === orderId);
    if (target?.status === "Cancelled") {
      return;
    }
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id,quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      setError(itemsError.message || "Unable to cancel order.");
      return;
    }

    await Promise.all(
      (items ?? []).map(async (item) => {
        const { data: product } = await supabase
          .from("products")
          .select("id,stock")
          .eq("id", item.product_id)
          .maybeSingle();
        if (!product?.id) return null;
        return supabase
          .from("products")
          .update({
            stock: (product.stock ?? 0) + (item.quantity ?? 0),
          })
          .eq("id", item.product_id);
      })
    );

    await handleStatusChange(orderId, "Cancelled");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Orders</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Order Management</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Filter Status
        </p>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] ring-1 ring-white/20"
        >
          <option value="All">All</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Tracking
        </p>
        <select
          value={trackingFilter}
          onChange={(event) => setTrackingFilter(event.target.value)}
          className="rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] ring-1 ring-white/20"
        >
          <option value="All">All</option>
          <option value="Has Tracking">Has Tracking Number</option>
          <option value="No Tracking">No Tracking Number</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#111111] text-xs uppercase tracking-[0.3em] text-white/60">
            <tr>
              <th className="px-6 py-4">Order No.</th>
              <th className="px-6 py-4">Customer Email</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Delivery Method</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr className="border-t border-white/10 bg-black/40">
                <td className="px-6 py-6 text-white/60" colSpan={7}>
                  {statusFilter === "All"
                    ? "No orders yet."
                    : "No orders for this status yet."}
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-white/10 bg-black/40">
                <td className="px-6 py-4">
                  {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-4">{order.customers?.email ?? "Guest"}</td>
                <td className="px-6 py-4 text-xs text-white/60">
                  {(order.order_items ?? []).map((item, index) => (
                    <span key={index}>
                      {item.products?.name ?? "Item"} x{item.quantity}
                      {index < order.order_items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, event.target.value)}
                    className="rounded-full bg-black px-3 py-2 text-xs uppercase tracking-[0.3em] ring-1 ring-white/20"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">{order.delivery_method}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setTrackingDraft(order.tracking_number ?? "");
                        setTrackingMessage("");
                        setTrackingError("");
                      }}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white"
                    >
                      Details
                    </button>
                    {order.status !== "Cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.id)}
                        className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
                Order Information
              </h2>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p>
                  Order Number:{" "}
                  <span className="text-white">
                    {selectedOrder.order_number ||
                      selectedOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </p>
                <p>
                  Date:{" "}
                  <span className="text-white">
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleString()
                      : "-"}
                  </span>
                </p>
                <p>
                  Total:{" "}
                  <span className="text-white">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </p>
                <p>
                  Delivery Method:{" "}
                  <span className="text-white">
                    {selectedOrder.delivery_method || "-"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
                Customer Information
              </h2>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p>
                  Name:{" "}
                  <span className="text-white">
                    {selectedOrder.shipping_name || "Guest"}
                  </span>
                </p>
                <p>
                  Phone:{" "}
                  <span className="text-white">{selectedOrder.phone || "-"}</span>
                </p>
                <p>
                  Address:{" "}
                  <span className="text-white">{selectedOrder.address || "-"}</span>
                </p>
                <p>
                  Email:{" "}
                  <span className="text-white">
                    {selectedOrder.customers?.email ?? "Guest"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
                Items Ordered
              </h2>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                {(selectedOrder.order_items ?? []).map((item, index) => (
                  <p key={`${selectedOrder.id}-${index}`}>
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
                {(selectedOrder.order_items ?? []).length === 0 && (
                  <p className="text-white/50">No items recorded.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
                Order Status
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(event) =>
                    handleStatusChange(selectedOrder.id, event.target.value)
                  }
                  className="rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] ring-1 ring-white/20"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {selectedOrder.tracking_number &&
                  selectedOrder.status !== "Shipped" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedOrder.id, "Shipped")}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white"
                    >
                      Set to Shipped
                    </button>
                  )}
              </div>
              {selectedOrder.tracking_number &&
                selectedOrder.status !== "Shipped" && (
                  <p className="mt-3 text-xs text-white/50">
                    Tracking number added. Suggested status: Shipped.
                  </p>
                )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
                Tracking Information
              </h2>
              <label className="mt-4 block text-xs uppercase tracking-[0.3em] text-white/60">
                Tracking Number
              </label>
              <input
                value={trackingDraft}
                onChange={(event) => setTrackingDraft(event.target.value)}
                placeholder="Enter courier tracking number (ex: JNT123456789PH)"
                className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-sm text-white ring-1 ring-white/10 focus:ring-white/40"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  disabled={trackingSaving}
                  className="glow-button rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black"
                >
                  {trackingSaving ? "Saving" : "Save"}
                </button>
                {selectedOrder.tracking_number && (
                  <a
                    href={`https://www.17track.net/en/track?nums=${encodeURIComponent(
                      selectedOrder.tracking_number
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
                  >
                    Track Package
                  </a>
                )}
              </div>
              {trackingError && (
                <p className="mt-3 text-sm text-red-400">{trackingError}</p>
              )}
              {trackingMessage && (
                <p className="mt-3 text-sm text-emerald-300">{trackingMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

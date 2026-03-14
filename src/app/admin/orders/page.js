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

  async function fetchOrders() {
    setError("");
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(
        "id,order_number,total,status,delivery_method,created_at,customer_id,customers(email),order_items(quantity,products(name))"
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

  async function handleStatusChange(orderId, status) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await fetchOrders();
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
            {orders.length === 0 && (
              <tr className="border-t border-white/10 bg-black/40">
                <td className="px-6 py-6 text-white/60" colSpan={7}>
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
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
                  {order.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order.id)}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white"
                    >
                      Cancel Order
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

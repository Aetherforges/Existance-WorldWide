/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { formatCurrency } from "../../../lib/format";

const statuses = ["Ordered", "Pending", "Processing", "Shipped", "Delivered"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select(
        "id,total,status,delivery_method,created_at,customer_id,customers(email),order_items(quantity,products(name))"
      )
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleStatusChange(orderId, status) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await fetchOrders();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Orders</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Order Management</h1>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#111111] text-xs uppercase tracking-[0.3em] text-white/60">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer Email</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Delivery Method</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr className="border-t border-white/10 bg-black/40">
                <td className="px-6 py-6 text-white/60" colSpan={6}>
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10 bg-black/40">
                <td className="px-6 py-4">{order.id}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

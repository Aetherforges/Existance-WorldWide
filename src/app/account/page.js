"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { formatCurrency } from "../../lib/format";

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.email) return;
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!customer?.id) {
        setOrders([]);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("id,total,status,delivery_method,created_at")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      setOrders(data ?? []);
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="page-shell">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Account</p>
          <h1 className="font-display text-3xl tracking-[0.2em]">Order History</h1>
          <p className="mt-2 text-sm text-white/60">
            {user ? `Signed in as ${user.email}` : "Login to view your orders."}
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-[#111111] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em]">Order {order.id}</p>
                  <p className="text-xs text-white/50">{order.created_at}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-white/60">{order.status}</p>
                  <p className="text-xs text-white/60">{order.delivery_method}</p>
                </div>
              </div>
            </div>
          ))}
          {user && orders.length === 0 && (
            <p className="text-white/60">No orders found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

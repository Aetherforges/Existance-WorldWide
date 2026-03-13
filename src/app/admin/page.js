"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabaseClient";
import { formatCurrency } from "../../lib/format";

const AnalyticsChart = dynamic(() => import("../../components/AnalyticsChart"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
      <div className="h-4 w-32 rounded-full bg-white/10" />
      <div className="mt-4 h-40 rounded-2xl bg-white/5" />
    </div>
  ),
});

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("id,total,status,created_at")
        .order("created_at", { ascending: false });
      if (!active) return;
      setOrders(data ?? []);
      const { count } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true });
      if (!active) return;
      setCustomerCount(count ?? 0);
      const { data: products } = await supabase
        .from("products")
        .select("id,name,category,price,stock")
        .order("created_at", { ascending: false });
      if (!active) return;
      setInventory(products ?? []);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    const pending = orders.filter((order) => order.status === "Pending").length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    return { totalOrders, revenue, pending, delivered };
  }, [orders]);

  const dailyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyData = [12, 18, 10, 24, 22, 16, 30];

  const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyData = [120, 180, 260, 210, 300, 380];

  function AnimatedNumber({ value, formatter }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let frame = 0;
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const nextValue = Math.round(value * progress);
        setDisplayValue(nextValue);
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      }

      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [value]);

    return (
      <span className="text-3xl">
        {formatter ? formatter(displayValue) : displayValue}
      </span>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Overview</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Total Orders</p>
          <div className="mt-4">
            <AnimatedNumber value={metrics.totalOrders} />
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Revenue</p>
          <div className="mt-4">
            <AnimatedNumber value={metrics.revenue} formatter={formatCurrency} />
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Customers</p>
          <div className="mt-4">
            <AnimatedNumber value={customerCount} />
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pending Orders</p>
          <div className="mt-4">
            <AnimatedNumber value={metrics.pending} />
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Delivered Orders</p>
          <div className="mt-4">
            <AnimatedNumber value={metrics.delivered} />
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart title="Daily Sales" labels={dailyLabels} data={dailyData} />
        <AnalyticsChart
          title="Monthly Revenue"
          labels={monthlyLabels}
          data={monthlyData}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">
          Inventory Overview
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.3em] text-white/60">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const stock = item.stock ?? 0;
                const status =
                  stock === 0 ? "Out of Stock" : stock < 5 ? "Low Stock" : "In Stock";
                const color =
                  stock === 0
                    ? "text-red-300"
                    : stock < 5
                      ? "text-amber-300"
                      : "text-emerald-300";
                return (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.category || "Uncategorized"}</td>
                    <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">{stock}</td>
                    <td className={`px-4 py-3 ${color}`}>{status}</td>
                  </tr>
                );
              })}
              {inventory.length === 0 && (
                <tr className="border-t border-white/10">
                  <td className="px-4 py-4 text-white/50" colSpan={5}>
                    No inventory items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

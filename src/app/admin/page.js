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
  const [orderItems, setOrderItems] = useState([]);
  const [range, setRange] = useState(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 30);
    return {
      from: start.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
    };
  });

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("id,total,status,created_at,customer_id,shipping_name,phone")
        .order("created_at", { ascending: false });
      if (!active) return;
      setOrders(data ?? []);
      if (!active) return;
      const uniqueCustomers = new Set();
      (data ?? []).forEach((order) => {
        if (order.customer_id) {
          uniqueCustomers.add(`id:${order.customer_id}`);
        } else if (order.shipping_name || order.phone) {
          uniqueCustomers.add(
            `guest:${order.shipping_name || ""}:${order.phone || ""}`.toLowerCase()
          );
        }
      });
      setCustomerCount(uniqueCustomers.size);
      const { data: products } = await supabase
        .from("products")
        .select("id,name,category,price,stock,cost")
        .order("created_at", { ascending: false });
      if (!active) return;
      setInventory(products ?? []);

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("order_id,product_id,quantity,price,products(cost)");
      if (!active) return;
      setOrderItems(orderItems ?? []);
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
    const costTotal = (orderItems ?? []).reduce((sum, item) => {
      const cost = item.products?.cost ?? 0;
      return sum + cost * (item.quantity ?? 0);
    }, 0);
    const profit = revenue - costTotal;
    return { totalOrders, revenue, pending, delivered, costTotal, profit };
  }, [orders, orderItems]);

  const filteredOrders = useMemo(() => {
    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return orders;
    }
    toDate.setHours(23, 59, 59, 999);
    return orders.filter((order) => {
      if (!order.created_at) return false;
      const created = new Date(order.created_at);
      return created >= fromDate && created <= toDate;
    });
  }, [orders, range.from, range.to]);

  const dailyLabels = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push(date);
    }
    return days.map((date) =>
      date.toLocaleDateString("en-US", { weekday: "short" })
    );
  }, []);

  const dailyData = useMemo(() => {
    const now = new Date();
    const totals = new Array(7).fill(0);
    filteredOrders.forEach((order) => {
      if (!order.created_at) return;
      const created = new Date(order.created_at);
      const diff = Math.floor(
        (now.setHours(0, 0, 0, 0) - created.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      if (diff >= 0 && diff < 7) {
        const idx = 6 - diff;
        totals[idx] += order.total ?? 0;
      }
    });
    return totals;
  }, [filteredOrders]);

  const monthlyLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleDateString("en-US", { month: "short" }));
    }
    return labels;
  }, []);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const totals = new Array(6).fill(0);
    filteredOrders.forEach((order) => {
      if (!order.created_at) return;
      const created = new Date(order.created_at);
      const monthDiff =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());
      if (monthDiff >= 0 && monthDiff < 6) {
        const idx = 5 - monthDiff;
        totals[idx] += order.total ?? 0;
      }
    });
    return totals;
  }, [filteredOrders]);

  const yearlyLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    for (let i = 4; i >= 0; i -= 1) {
      labels.push(String(now.getFullYear() - i));
    }
    return labels;
  }, []);

  const yearlyData = useMemo(() => {
    const now = new Date();
    const totals = new Array(5).fill(0);
    filteredOrders.forEach((order) => {
      if (!order.created_at) return;
      const created = new Date(order.created_at);
      const diff = now.getFullYear() - created.getFullYear();
      if (diff >= 0 && diff < 5) {
        const idx = 4 - diff;
        totals[idx] += order.total ?? 0;
      }
    });
    return totals;
  }, [filteredOrders]);

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

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Date Range</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={range.from}
            onChange={(event) =>
              setRange((prev) => ({ ...prev, from: event.target.value }))
            }
            className="rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-white ring-1 ring-white/10 focus:ring-white/40"
          />
          <input
            type="date"
            value={range.to}
            onChange={(event) =>
              setRange((prev) => ({ ...prev, to: event.target.value }))
            }
            className="rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-white ring-1 ring-white/10 focus:ring-white/40"
          />
        </div>
        <p className="text-xs text-white/50">
          Showing {filteredOrders.length} orders
        </p>
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
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Total Sales</p>
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
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Customers Ordered
          </p>
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
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Cost & Profit</p>
          <div className="mt-4 space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Cost</div>
            <AnimatedNumber value={metrics.costTotal} formatter={formatCurrency} />
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Profit</div>
            <AnimatedNumber value={metrics.profit} formatter={formatCurrency} />
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-white/10 bg-[#111111] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Cost Only</p>
          <div className="mt-4">
            <AnimatedNumber value={metrics.costTotal} formatter={formatCurrency} />
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
        <AnalyticsChart
          title="Yearly Revenue"
          labels={yearlyLabels}
          data={yearlyData}
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

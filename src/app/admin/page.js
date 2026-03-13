"use client";

import { useEffect, useMemo, useState } from "react";
import AnalyticsChart from "../../components/AnalyticsChart";
import { supabase } from "../../lib/supabaseClient";
import { formatCurrency } from "../../lib/format";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);

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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Overview</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Total Orders</p>
          <p className="mt-4 text-3xl">{metrics.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Revenue</p>
          <p className="mt-4 text-3xl">{formatCurrency(metrics.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Customers</p>
          <p className="mt-4 text-3xl">{customerCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pending Orders</p>
          <p className="mt-4 text-3xl">{metrics.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Delivered Orders</p>
          <p className="mt-4 text-3xl">{metrics.delivered}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart title="Daily Sales" labels={dailyLabels} data={dailyData} />
        <AnalyticsChart
          title="Monthly Revenue"
          labels={monthlyLabels}
          data={monthlyData}
        />
      </div>
    </div>
  );
}

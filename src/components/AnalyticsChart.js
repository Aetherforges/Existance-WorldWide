"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AnalyticsChart({ title, labels, data }) {
  const accent = "#22c55e";
  const down = "#ef4444";
  const fill = "rgba(255,255,255,0.08)";

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: accent,
        backgroundColor: fill,
        tension: 0.4,
        fill: true,
        segment: {
          borderColor: (ctx) => {
            const prev = ctx.p0.parsed.y;
            const next = ctx.p1.parsed.y;
            return next >= prev ? accent : down;
          },
        },
        pointBackgroundColor: (ctx) => {
          const idx = ctx.dataIndex;
          if (idx === 0) return accent;
          const prev = ctx.dataset.data[idx - 1] ?? 0;
          const current = ctx.dataset.data[idx] ?? 0;
          return current >= prev ? accent : down;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111111",
        borderColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "rgba(255,255,255,0.6)" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "rgba(255,255,255,0.6)" },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
      <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
        {title}
      </h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

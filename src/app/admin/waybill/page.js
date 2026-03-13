"use client";

import { useMemo, useState } from "react";

export default function WaybillPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const waybillText = useMemo(() => {
    return [
      "EXIST WORLD WIDE - WAYBILL",
      `Name: ${form.name || "-"}`,
      `Phone: ${form.phone || "-"}`,
      `Shipping Address: ${form.address || "-"}`,
      form.notes ? `Notes: ${form.notes}` : null,
      "© All Rights Reserved Exist WorldWide",
    ]
      .filter(Boolean)
      .join("\n");
  }, [form]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8">
      <style>{`@media print {
        body { background: white !important; color: black !important; }
        header, nav, footer, .no-print { display: none !important; }
        .print-area { border: none !important; }
      }`}</style>

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Shipping</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Waybill Print</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Name</label>
          <input
            value={form.name}
            onChange={handleChange("name")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Phone Number
          </label>
          <input
            value={form.phone}
            onChange={handleChange("phone")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Shipping Address
          </label>
          <textarea
            rows="4"
            value={form.address}
            onChange={handleChange("address")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Notes (optional)
          </label>
          <textarea
            rows="3"
            value={form.notes}
            onChange={handleChange("notes")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <button
            type="button"
            onClick={handlePrint}
            className="glow-button no-print mt-8 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          >
            Print Waybill
          </button>
        </div>

        <div className="print-area rounded-3xl border border-white/10 bg-[#111111] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Preview</p>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-white/80">
            {waybillText}
          </pre>
        </div>
      </div>
    </div>
  );
}

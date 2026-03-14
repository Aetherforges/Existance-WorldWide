"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { formatCurrency } from "../../../lib/format";

export default function WaybillPage() {
  const [form, setForm] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerCity: "",
    buyerProvince: "",
    buyerZip: "",
    productQuantity: 1,
    sendDate: new Date().toISOString().slice(0, 10),
  });
  const [orderId, setOrderId] = useState(
    Math.random().toString(36).slice(2, 12).toUpperCase()
  );
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSearchError, setOrderSearchError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      const { data } = await supabase
        .from("orders")
        .select(
          "id,order_number,total,created_at,shipping_name,phone,address,delivery_method,order_items(quantity,product_name,products(name,price))"
        )
        .order("created_at", { ascending: false });
      if (!active) return;
      setOrders(data ?? []);
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    const order = orders.find((item) => item.id === selectedOrderId);
    if (!order) return;

    const totalQty = (order.order_items ?? []).reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );

    setForm((prev) => ({
      ...prev,
      buyerName: order.shipping_name || prev.buyerName,
      buyerPhone: order.phone || prev.buyerPhone,
      buyerAddress: order.address || prev.buyerAddress,
      productQuantity: totalQty || prev.productQuantity,
      sendDate: order.created_at
        ? new Date(order.created_at).toISOString().slice(0, 10)
        : prev.sendDate,
    }));
    setOrderId(
      (order.order_number || order.id.slice(0, 12)).toUpperCase()
    );
    setSelectedOrder(order);
  }, [orders, selectedOrderId]);

  function handleOrderSearch() {
    const term = orderSearch.trim().toLowerCase();
    if (!term) {
      setOrderSearchError("Enter an order ID to search.");
      return;
    }
    const match = orders.find((order) => {
      const orderNumber = order.order_number?.toLowerCase() ?? "";
      const orderId = order.id.toLowerCase();
      return (
        orderNumber === term ||
        orderNumber.startsWith(term) ||
        orderId.startsWith(term)
      );
    });
    if (!match) {
      setOrderSearchError("No matching order found.");
      return;
    }
    setOrderSearchError("");
    setSelectedOrderId(match.id);
  }

  const sellerDetails = useMemo(
    () => ({
      name: "Exist World Wide",
      address: "5041 Venus St, Cainta Rizal",
    }),
    []
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8">
      <style>{`@media print {
        body { background: white !important; color: black !important; }
        header, nav, footer, .no-print { display: none !important; }
        .print-area { border: none !important; }
        .print-area * { color: black !important; }
      }`}</style>

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Shipping</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Waybill Print</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            Search Order Number
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Paste order number"
                className="w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
              />
            </div>
            <button
              type="button"
              onClick={handleOrderSearch}
              className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.3em]"
            >
              Load Order
            </button>
          </div>
          {orderSearchError && (
            <p className="mt-2 text-xs text-red-400">{orderSearchError}</p>
          )}

          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            Buyer Name
          </label>
          <input
            value={form.buyerName}
            onChange={handleChange("buyerName")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Buyer Phone Number
          </label>
          <input
            value={form.buyerPhone}
            onChange={handleChange("buyerPhone")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <label className="mt-6 block text-xs uppercase tracking-[0.3em] text-white/60">
            Buyer Address
          </label>
          <textarea
            rows="4"
            value={form.buyerAddress}
            onChange={handleChange("buyerAddress")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                City
              </label>
              <input
                value={form.buyerCity}
                onChange={handleChange("buyerCity")}
                className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                Province
              </label>
              <input
                value={form.buyerProvince}
                onChange={handleChange("buyerProvince")}
                className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                ZIP Code
              </label>
              <input
                value={form.buyerZip}
                onChange={handleChange("buyerZip")}
                className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                Product Quantity
              </label>
              <input
                type="number"
                min="1"
                value={form.productQuantity}
                onChange={handleChange("productQuantity")}
                className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                Send Date
              </label>
              <input
                type="date"
                value={form.sendDate}
                onChange={handleChange("sendDate")}
                className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white ring-1 ring-white/10 focus:ring-white/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="glow-button no-print mt-8 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          >
            Print Waybill
          </button>
        </div>

        <div className="print-area rounded-3xl border border-white/10 bg-[#111111] p-6 text-sm text-white/90">
          <div className="border border-white/10">
            <div className="grid grid-cols-[1fr_1fr] border-b border-white/10">
              <div className="border-r border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Order Number
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[0.2em]">
                  {orderId}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Send Date
                </p>
                <p className="mt-2">{form.sendDate || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr] border-b border-white/10">
              <div className="border-r border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Buyer
                </p>
                <p className="mt-2 font-semibold">{form.buyerName || "-"}</p>
                <p className="mt-1">{form.buyerPhone || "-"}</p>
                <p className="mt-2 text-white/70">{form.buyerAddress || "-"}</p>
                <p className="mt-2 text-white/70">
                  {form.buyerCity || "-"}, {form.buyerProvince || "-"}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Seller
                </p>
                <p className="mt-2 font-semibold">{sellerDetails.name}</p>
                <p className="mt-2 text-white/70">{sellerDetails.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr] border-b border-white/10">
              <div className="border-r border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Product Quantity
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {Number(form.productQuantity) || 1}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Total Price
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {typeof selectedOrder?.total === "number"
                    ? formatCurrency(selectedOrder.total)
                    : "-"}
                </p>
              </div>
            </div>

            <div className="border-b border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Items Ordered
              </p>
              <div className="mt-2 space-y-1 text-white/70">
                {(selectedOrder?.order_items ?? []).map((item, index) => (
                  <p key={`${item.product_name || item.products?.name}-${index}`}>
                    {item.product_name || item.products?.name || "Item"} x
                    {item.quantity}
                  </p>
                ))}
                {(selectedOrder?.order_items ?? []).length === 0 && <p>-</p>}
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-white/60">
                © All Rights Reserved Exist WorldWide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

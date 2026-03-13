"use client";

import Link from "next/link";
import { LayoutGrid, Package, ClipboardList, Printer, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function AdminSidebar() {
  const router = useRouter();
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin-login");
  }

  return (
    <aside className="w-full border-b border-white/10 bg-black/60 p-6 lg:max-w-xs lg:border-b-0 lg:border-r">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Admin</p>
        <h1 className="font-display text-lg tracking-[0.35em]">EXIST WORLD WIDE</h1>
      </div>
      <nav className="space-y-4 text-sm uppercase tracking-[0.2em]">
        <Link href="/admin" className="flex items-center gap-3 hover:text-white/70">
          <LayoutGrid size={18} /> Dashboard
        </Link>
        <Link href="/admin/products" className="flex items-center gap-3 hover:text-white/70">
          <Package size={18} /> Products
        </Link>
        <Link href="/admin/orders" className="flex items-center gap-3 hover:text-white/70">
          <ClipboardList size={18} /> Orders
        </Link>
        <Link href="/admin/waybill" className="flex items-center gap-3 hover:text-white/70">
          <Printer size={18} /> Waybill
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-white/60 hover:text-white"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>
    </aside>
  );
}

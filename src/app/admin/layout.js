"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function checkRole() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        router.replace("/admin-login");
        return;
      }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        router.replace("/admin-login");
        return;
      }
      if (active) setLoading(false);
    }
    checkRole();
    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}

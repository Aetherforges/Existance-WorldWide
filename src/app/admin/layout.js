import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout({ children }) {
  const adminSession = cookies().get("admin_session");
  if (!adminSession) {
    redirect("/admin-login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}

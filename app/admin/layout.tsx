// app/admin/layout.tsx
import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin — Portfolio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
      </div>
    </div>
  );
}

import React from "react";
import { requireAdmin } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Panel Teknisi - RimTech Comp",
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminSidebar adminName={admin.name || "Teknisi RimTech"} adminRole={admin.role || "ADMIN"} />
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}

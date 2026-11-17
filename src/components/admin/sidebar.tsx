"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ReceiptText,
  MessageSquare,
  Laptop,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/lib/actions/admin";

export function AdminSidebar({
  adminName,
  adminRole,
}: {
  adminName: string;
  adminRole: string;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard Ringkasan", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Antrean & Pengerjaan", icon: ClipboardList },
    { href: "/admin/slots", label: "Kuota & Kalender Toko", icon: CalendarDays },
    { href: "/admin/transaksi", label: "Rekap Keuangan", icon: ReceiptText },
    { href: "/admin/whatsapp-logs", label: "Log Notifikasi WA", icon: MessageSquare },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand header */}
      <div className="sidebar-brand">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="brand-icon" style={{ width: "2rem", height: "2rem" }}>
            <Laptop style={{ width: "1.1rem", height: "1.1rem" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#ffffff" }}>
            Panel <span style={{ color: "var(--primary)" }}>Teknisi</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {links.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-item", isActive && "active")}
            >
              <Icon style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout footer */}
      <div style={{ padding: "1rem", borderTop: "1px solid #1e293b", marginTop: "auto", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "#1e293b",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {adminName}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{adminRole}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Link
            href="/"
            target="_blank"
            className="btn btn-outline btn-sm"
            style={{ backgroundColor: "#1e293b", color: "#cbd5e1", borderColor: "#334155", width: "100%", justifyContent: "flex-start" }}
          >
            <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Lihat Web Publik</span>
          </Link>
          <button
            type="button"
            onClick={() => adminLogoutAction()}
            className="btn btn-outline btn-sm"
            style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#fca5a5", borderColor: "rgba(220, 38, 38, 0.2)", width: "100%", justifyContent: "flex-start" }}
          >
            <LogOut style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

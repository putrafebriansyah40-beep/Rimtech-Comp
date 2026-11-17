import React from "react";
import { STORE } from "@/lib/constants";
import { Clock } from "lucide-react";

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="admin-header">
      <div>
        <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500 }}>
          <Clock style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
          <span>Toko: {STORE.hours}</span>
        </div>
      </div>
    </header>
  );
}

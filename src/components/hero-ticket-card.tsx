"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Laptop, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface HeroTicketCardProps {
  dpAmount: number;
}

export function HeroTicketCard({ dpAmount }: HeroTicketCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius-2xl)",
        border: isHovered ? "1px solid var(--primary-border)" : "1px solid var(--border)",
        padding: "1.75rem",
        boxShadow: isHovered
          ? "0 25px 35px -10px rgba(15, 23, 42, 0.12), 0 0 50px rgba(2, 132, 199, 0.18)"
          : "0 20px 30px -10px rgba(15, 23, 42, 0.1), 0 0 40px rgba(2, 132, 199, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        maxWidth: "460px",
        margin: "0 auto",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header: Title & Live Pulse Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            className="brand-icon"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              transform: isHovered ? "scale(1.05) rotate(-2deg)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
          >
            <Laptop style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>Contoh Tiket Servis</h4>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              RMC-20261021-001
            </span>
          </div>
        </div>

        {/* Live Status Badge with Radar Ping Dot */}
        <span className="badge badge-blue" style={{ gap: "0.5rem" }}>
          <span className="ping-dot-container">
            <span className="ping-dot-ring" />
            <span className="ping-dot-core" />
          </span>
          <span>Sedang Diperbaiki</span>
        </span>
      </div>

      {/* Ticket Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.75rem" }}>
        {/* Unit Info */}
        <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)", display: "block" }}>Unit Laptop:</span>
          <strong style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.8125rem", display: "block", marginTop: "0.125rem" }}>
            Asus ROG Strix G15 (Keluhan: Overheat & Kipas Bising)
          </strong>
        </div>

        {/* Grid DP & Schedule */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.6875rem", display: "block" }}>DP Terbayar:</span>
            <strong style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.875rem" }}>
              {formatRupiah(dpAmount)}
            </strong>
          </div>
          <div style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.6875rem", display: "block" }}>Jadwal Antar:</span>
            <strong style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem" }}>10:00 WIB</strong>
          </div>
        </div>

        {/* Live Progress Bar with Shimmer */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "#f0fdf4",
            border: "1px solid var(--success-border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--success-hover)", fontWeight: 600, fontSize: "0.6875rem" }}>
              <Activity style={{ width: "0.875rem", height: "0.875rem", color: "var(--success)" }} />
              <span>Progres Pengerjaan: 75%</span>
            </span>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Tahap 3/4</span>
          </div>

          <div className="shimmer-progress-bar">
            <div className="shimmer-progress-fill" style={{ width: "75%" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.125rem" }}>
            <CheckCircle2 style={{ width: "0.875rem", height: "0.875rem", color: "var(--success)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.6875rem", color: "var(--success-hover)", lineHeight: 1.3 }}>
              Pembersihan pasta termal selesai, sedang pengujian performa beban.
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href="/lacak/RMC-20261021-001"
        className="btn btn-secondary btn-block"
        style={{
          borderRadius: "var(--radius-md)",
          padding: "0.625rem",
          fontSize: "0.8125rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.375rem",
        }}
      >
        <span>Buka Contoh Halaman Tracking</span>
        <ChevronRight style={{ width: "0.875rem", height: "0.875rem" }} />
      </Link>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Laptop, CalendarPlus, Search, ShieldCheck, Menu, X, Clock, MapPin } from "lucide-react";
import { STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/booking", label: "Booking Servis", icon: CalendarPlus },
    { href: "/lacak", label: "Lacak Status", icon: Search },
    { href: "/#layanan", label: "Layanan" },
    { href: "/#faq", label: "FAQ & Lokasi" },
  ];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", borderBottom: "1px solid var(--border)", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)" }}>
      {/* Top Banner Bar */}
      <div style={{ backgroundColor: "#0f172a", color: "#cbd5e1", fontSize: "0.75rem", padding: "0.375rem 1rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Clock style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
              <span>Jam Operasional: {STORE.hours}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
              <span>{STORE.address}</span>
            </span>
          </div>
          <div>
            <Link
              href="/admin"
              style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <ShieldCheck style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
              <span>Panel Teknisi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container" style={{ height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="brand-icon">
            <Laptop style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
              RimTech <span style={{ color: "var(--primary)" }}>Comp</span>
            </span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-muted)" }}>
              Laptop Repair & Service
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                {Icon && <Icon style={{ width: "1rem", height: "1rem" }} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/lacak" className="btn btn-outline btn-sm">
            <Search style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Cek Status</span>
          </Link>
          <Link href="/booking" className="btn btn-primary btn-sm">
            <CalendarPlus style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Booking Servis</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

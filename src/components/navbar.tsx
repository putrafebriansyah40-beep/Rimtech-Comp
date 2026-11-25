"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Laptop, CalendarPlus, Search, ShieldCheck, Menu, X, Clock, MapPin } from "lucide-react";
import { STORE } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll reading progress indicator (Scroll-Craft & Ponytail standard)
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/booking", label: "Booking Servis", icon: CalendarPlus },
    { href: "/lacak", label: "Lacak Status", icon: Search },
    { href: "/#layanan", label: "Layanan" },
    { href: "/#faq", label: "FAQ & Lokasi" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        borderBottom: "1px solid var(--border)",
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Top Banner Bar */}
      <div style={{ backgroundColor: "#0f172a", color: "#cbd5e1", fontSize: "0.75rem", padding: "0.375rem 1rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Clock style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
              <span className="hidden sm:inline">Jam Operasional: </span>
              <span>{STORE.hours}</span>
            </span>
            <span className="hidden sm:flex" style={{ alignItems: "center", gap: "0.375rem" }}>
              <MapPin style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
              <span className="line-clamp-1">{STORE.address}</span>
            </span>
          </div>
          <div>
            <Link
              href="/admin"
              style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.375rem", transition: "color 0.2s" }}
              className="hover:text-white"
            >
              <ShieldCheck style={{ width: "0.875rem", height: "0.875rem", color: "var(--primary)" }} />
              <span>Panel Teknisi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container" style={{ height: "4.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand */}
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
        <nav className="hidden md:flex" style={{ alignItems: "center", gap: "0.375rem" }}>
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
                className={!isActive ? "hover:bg-slate-100 hover:text-sky-600" : ""}
              >
                {Icon && <Icon style={{ width: "1rem", height: "1rem" }} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions & Mobile Trigger */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Link href="/lacak" className="btn btn-outline btn-sm hidden sm:inline-flex">
            <Search style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Cek Status</span>
          </Link>
          <Link href="/booking" className="btn btn-primary btn-sm">
            <CalendarPlus style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Booking Servis</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobileMenuOpen ? <X style={{ width: "1.25rem", height: "1.25rem" }} /> : <Menu style={{ width: "1.25rem", height: "1.25rem" }} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                }}
              >
                {Icon && <Icon style={{ width: "1.125rem", height: "1.125rem" }} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}>
            <Link
              href="/lacak"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-outline btn-sm btn-block"
            >
              <Search style={{ width: "0.875rem", height: "0.875rem" }} />
              <span>Cek Status</span>
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Scroll Progress Bar (Scroll-Craft reading indicator) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2.5px",
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%)",
          transition: "width 0.1s ease-out",
          boxShadow: "0 0 8px rgba(6, 182, 212, 0.6)",
        }}
      />
    </header>
  );
}

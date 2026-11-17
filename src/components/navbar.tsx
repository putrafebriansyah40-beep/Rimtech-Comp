"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Laptop,
  CalendarPlus,
  Search,
  ShieldCheck,
  Menu,
  X,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { STORE } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/booking", label: "Booking Servis", icon: CalendarPlus },
    { href: "/lacak", label: "Lacak Status", icon: Search },
    { href: "/#layanan", label: "Layanan" },
    { href: "/#faq", label: "FAQ & Lokasi" },
  ];

  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
    isSwipeActive: boolean;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
    isSwipeActive: false,
  });

  // Calculate sliding / swiping pill position
  useEffect(() => {
    const activeRouteIdx = navLinks.findIndex((l) =>
      l.href === "/"
        ? pathname === "/"
        : pathname === l.href || (l.href.startsWith("/") && pathname.startsWith(l.href) && !l.href.includes("#")),
    );

    const targetIdx = hoveredIdx !== null ? hoveredIdx : activeRouteIdx;
    const targetEl = itemRefs.current[targetIdx];
    const container = navRef.current;

    if (targetEl && container) {
      const targetRect = targetEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setIndicatorStyle({
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        opacity: 1,
        isSwipeActive: true,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [pathname, hoveredIdx]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid rgba(226, 232, 240, 0.75)",
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 4px 25px -4px rgba(15, 23, 42, 0.05), 0 0 15px rgba(2, 132, 199, 0.04)",
        transition: "all 0.3s ease",
      }}
    >
      <style>{`
        @keyframes swipeGlow {
          0% { transform: scaleX(0.85); opacity: 0.6; }
          50% { transform: scaleX(1.05); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0.8; }
        }
        .nav-link-item:hover .nav-icon {
          transform: translateY(-1px) scale(1.1);
          color: #0284c7;
        }
      `}</style>

      {/* Top Banner Bar */}
      <div
        style={{
          backgroundColor: "#0f172a",
          color: "#cbd5e1",
          fontSize: "0.75rem",
          padding: "0.375rem 1rem",
          borderBottom: "1px solid rgba(51, 65, 85, 0.4)",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Clock style={{ width: "0.875rem", height: "0.875rem", color: "#38bdf8" }} />
              <span>Jam Operasional: {STORE.hours}</span>
            </span>
            <span style={{ display: "none", alignItems: "center", gap: "0.375rem" }} className="sm:inline-flex">
              <MapPin style={{ width: "0.875rem", height: "0.875rem", color: "#38bdf8" }} />
              <span>{STORE.address}</span>
            </span>
          </div>
          <div>
            <Link
              href="/admin"
              style={{
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              <ShieldCheck style={{ width: "0.875rem", height: "0.875rem", color: "#38bdf8" }} />
              <span>Panel Teknisi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="container" style={{ height: "4.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div
            className="brand-icon"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              color: "#ffffff",
              transition: "transform 0.2s ease",
            }}
          >
            <Laptop style={{ width: "1.35rem", height: "1.35rem" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              RimTech <span style={{ color: "#0284c7" }}>Comp</span>
            </span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b" }}>
              Laptop Repair & Service
            </span>
          </div>
        </Link>

        {/* Desktop Links with Animated Swipe Capsule Indicator */}
        <nav
          ref={navRef}
          onMouseLeave={() => setHoveredIdx(null)}
          style={{
            position: "relative",
            display: "none",
            alignItems: "center",
            padding: "0.25rem",
            borderRadius: "9999px",
            backgroundColor: "rgba(241, 245, 249, 0.65)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
          className="md:flex"
        >
          {/* Animated Swipe Background Capsule */}
          <div
            style={{
              position: "absolute",
              top: "0.25rem",
              bottom: "0.25rem",
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
              boxShadow: "0 2px 10px rgba(2, 132, 199, 0.15), 0 0 0 1px rgba(56, 189, 248, 0.25)",
              pointerEvents: "none",
              transition: "left 0.32s cubic-bezier(0.34, 1.3, 0.64, 1), width 0.32s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease",
              zIndex: 1,
            }}
          >
            {/* Subtle Neon Swipe Bottom Accent Line */}
            <div
              style={{
                position: "absolute",
                bottom: "3px",
                left: "20%",
                width: "60%",
                height: "2px",
                borderRadius: "9999px",
                background: "linear-gradient(90deg, #0284c7 0%, #06b6d4 100%)",
                boxShadow: "0 0 8px #0284c7",
              }}
            />
          </div>

          {navLinks.map((link, idx) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || (link.href.startsWith("/") && pathname.startsWith(link.href) && !link.href.includes("#"));

            const isHovered = hoveredIdx === idx;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="nav-link-item"
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: isActive || isHovered ? 700 : 500,
                  color: isActive || isHovered ? "#0284c7" : "#475569",
                  textDecoration: "none",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  transform: isHovered ? "translateY(-1px)" : "none",
                }}
              >
                {Icon && (
                  <Icon
                    className="nav-icon"
                    style={{
                      width: "1rem",
                      height: "1rem",
                      color: isActive || isHovered ? "#0284c7" : "#64748b",
                      transition: "all 0.2s ease",
                    }}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/lacak"
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid #cbd5e1",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              color: "#334155",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            className="sm:inline-flex"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0284c7";
              e.currentTarget.style.color = "#0284c7";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(2, 132, 199, 0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            <Search style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Cek Status</span>
          </Link>

          <Link
            href="/booking"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1.125rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              color: "#ffffff",
              fontSize: "0.8125rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #0369a1 0%, #0891b2 100%)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(2, 132, 199, 0.45)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(2, 132, 199, 0.35)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <CalendarPlus style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Booking Servis</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.625rem",
              border: "1px solid #cbd5e1",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#0f172a",
              cursor: "pointer",
            }}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X style={{ width: "1.25rem", height: "1.25rem" }} /> : <Menu style={{ width: "1.25rem", height: "1.25rem" }} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with Frosted Blur */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(226, 232, 240, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
          className="md:hidden"
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
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0284c7" : "#334155",
                  backgroundColor: isActive ? "#e0f2fe" : "transparent",
                  textDecoration: "none",
                }}
              >
                {Icon && <Icon style={{ width: "1.125rem", height: "1.125rem" }} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

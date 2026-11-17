import React from "react";
import Link from "next/link";
import { Laptop, Phone, MapPin, Clock, ShieldCheck } from "lucide-react";
import { STORE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2.5rem" }}>
          {/* Brand info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="brand-icon">
                <Laptop style={{ width: "1.25rem", height: "1.25rem" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "#ffffff", lineHeight: 1.2 }}>
                  RimTech <span style={{ color: "var(--primary)" }}>Comp</span>
                </span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Jasa Servis & Reparasi Laptop</span>
              </div>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6 }}>
              Solusi perbaikan laptop transparan dengan sistem booking jadwal pasti, tracking progres
              real-time, serta pembayaran uang muka (DP) otomatis via QRIS.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4>Navigasi Cepat</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.875rem" }}>
              <li><Link href="/">Beranda</Link></li>
              <li><Link href="/booking">Reservasi Jadwal Servis</Link></li>
              <li><Link href="/lacak">Pelacakan Status & Nota</Link></li>
              <li><Link href="/#layanan">Katalog Kerusakan & Jasa</Link></li>
              <li>
                <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <ShieldCheck style={{ width: "1rem", height: "1rem", color: "var(--primary)" }} />
                  <span>Login Teknisi</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Hours */}
          <div>
            <h4>Kontak & Lokasi</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <MapPin style={{ width: "1rem", height: "1rem", color: "var(--primary)", flexShrink: 0, marginTop: "0.125rem" }} />
                <span>{STORE.address}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock style={{ width: "1rem", height: "1rem", color: "var(--primary)", flexShrink: 0 }} />
                <span>{STORE.hours}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone style={{ width: "1rem", height: "1rem", color: "var(--primary)", flexShrink: 0 }} />
                <span>WhatsApp: +{STORE.whatsapp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} RimTech Comp. Hak cipta dilindungi undang-undang.</span>
          <span>Sistem Informasi Booking Servis Berbasis React.js & MySQL</span>
        </div>
      </div>
    </footer>
  );
}

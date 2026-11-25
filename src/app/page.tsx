import React from "react";
import Link from "next/link";
import {
  Laptop,
  CalendarCheck,
  Wrench,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  HardDrive,
  Cpu,
  Monitor,
  BatteryCharging,
  Flame,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { STORE } from "@/lib/constants";
import { config } from "@/lib/config";
import { formatRupiah } from "@/lib/utils";

export default function HomePage() {
  const services = [
    {
      icon: Cpu,
      title: "Mati Total & Motherboard",
      desc: "Diagnosa short circuit, reballing chip, perbaikan IC power, & recovery bios.",
      badge: "Spesialisasi",
    },
    {
      icon: Monitor,
      title: "Ganti Layar LCD & LED",
      desc: "Mengatasi layar bergaris, blank putih/hitam, pecah, flickering, atau no-display.",
      badge: "Ready Stock",
    },
    {
      icon: Wrench,
      title: "Engsel & Rekondisi Casing",
      desc: "Perbaikan engsel patah, casing retak/pecah, baut dol, presisi kembali seperti baru.",
      badge: "Presisi",
    },
    {
      icon: HardDrive,
      title: "Upgrade SSD & RAM Kilat",
      desc: "Tingkatkan performa laptop jadul jadi 10x lebih kencang tanpa kehilangan data.",
      badge: "30 Menit",
    },
    {
      icon: Flame,
      title: "Overheating & Thermal Paste",
      desc: "Pembersihan debu fan pendingin, repaste thermal premium Arctic/Noctua, atasi kipas bising.",
      badge: "Perawatan",
    },
    {
      icon: BatteryCharging,
      title: "Baterai & Charger Adapter",
      desc: "Penggantian baterai drop/kembung original, servis port colokan DC-in yang longgar.",
      badge: "Garansi",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Booking Online 24/7",
      desc: "Pilih tanggal buka toko dan jam pengantaran sesuai sisa kuota harian yang tersedia.",
    },
    {
      step: "02",
      title: "Bayar DP via QRIS",
      desc: "Scan QRIS dinamis dari m-Banking / e-Wallet sebagai komitmen reservasi (pemotong biaya akhir).",
    },
    {
      step: "03",
      title: "Antar Unit & Pantau Live",
      desc: "Serahkan laptop ke toko. Pantau perkembangan pengerjaan secara mandiri di halaman Tracking.",
    },
    {
      step: "04",
      title: "Selesai & Pelunasan Toko",
      desc: "Terima notifikasi WhatsApp saat selesai, ambil laptop Anda, dan lunasi sisa biaya di toko.",
    },
  ];

  const faqs = [
    {
      q: "Mengapa harus reservasi booking online terlebih dahulu?",
      a: "RimTech Comp dikelola oleh teknisi tunggal profesional. Sistem booking dan kuota harian memastikan toko pasti buka saat Anda datang, unit Anda langsung tertangani tanpa menumpuk berhari-hari, dan Anda tidak kecewa mendapati toko tutup.",
    },
    {
      q: "Bagaimana cara kerja pembayaran uang muka (DP)?",
      a: `Uang muka sebesar ${formatRupiah(config.dpAmount)} dibayarkan via QRIS otomatis saat mengisi formulir. Nominal DP ini otomatis dipotong dari total biaya perbaikan akhir saat Anda mengambil unit. Jika booking ditolak oleh teknisi (misal sparepart diskontinu), DP dikembalikan 100%.`,
    },
    {
      q: "Apakah saya bisa memantau progres perbaikan laptop saya?",
      a: "Tentu saja! Anda akan menerima Kode Booking unik (misal: RMC-20261021-001). Cukup masukkan kode tersebut di halaman Lacak Status untuk melihat tahap diagnosa, perbaikan, hingga estimasi biaya secara transparan.",
    },
    {
      q: "Berapa lama estimasi pengerjaan laptop?",
      a: "Perawatan ringan & upgrade (SSD/RAM/Thermal) dapat selesai dalam 1-2 hari kerja. Kerusakan motherboard atau pemesanan sparepart khusus memerlukan waktu 3-7 hari kerja tergantung ketersediaan komponen.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "4.5rem 0 5.5rem",
          background: "linear-gradient(180deg, rgba(224, 242, 254, 0.5) 0%, #ffffff 60%, #f8fafc 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3.5rem", alignItems: "center" }}>
            {/* Left Copy */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h1
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                }}
              >
                Servis Laptop Tanpa Antre,{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Tanpa Tebak-Tebakan Jadwal
                </span>
              </h1>

              <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "560px" }}>
                Pilih jadwal penyerahan laptop sesuai kuota harian toko, bayar DP mudah via QRIS, dan
                pantau perkembangan perbaikan secara real-time langsung dari smartphone Anda.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
                <Link href="/booking" className="btn btn-primary btn-lg" style={{ boxShadow: "0 6px 20px rgba(2, 132, 199, 0.35)" }}>
                  <CalendarCheck style={{ width: "1.125rem", height: "1.125rem" }} />
                  <span>Booking Servis Sekarang</span>
                </Link>
                <Link href="/lacak" className="btn btn-outline btn-lg">
                  <span>Lacak Status Laptop</span>
                  <ChevronRight style={{ width: "1rem", height: "1rem", color: "var(--text-muted)" }} />
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--border)",
                  marginTop: "1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>100%</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Jadwal Terjadwal Pasti</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>QRIS</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Verifikasi Otomatis</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Real-Time</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Tracking Status Servis</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mock Card */}
            <div>
              <div
                style={{
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-2xl)",
                  border: "1px solid var(--border)",
                  padding: "1.75rem",
                  boxShadow: "0 20px 30px -10px rgba(15, 23, 42, 0.1), 0 0 40px rgba(2, 132, 199, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  maxWidth: "460px",
                  margin: "0 auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="brand-icon" style={{ width: "2.25rem", height: "2.25rem" }}>
                      <Laptop style={{ width: "1.125rem", height: "1.125rem" }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>Contoh Tiket Servis</h4>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>RMC-20261021-001</span>
                    </div>
                  </div>
                  <span className="badge badge-blue">
                    <span className="badge-dot" />
                    <span>Sedang Diperbaiki</span>
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.75rem" }}>
                  <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Unit Laptop:</span>
                    <strong style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.8125rem", display: "block", marginTop: "0.125rem" }}>
                      Asus ROG Strix G15 (Keluhan: Overheat & Kipas Bising)
                    </strong>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.6875rem", display: "block" }}>DP Terbayar:</span>
                      <strong style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.875rem" }}>
                        {formatRupiah(config.dpAmount)}
                      </strong>
                    </div>
                    <div style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.6875rem", display: "block" }}>Jadwal Antar:</span>
                      <strong style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem" }}>10:00 WIB</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--success-light)",
                      border: "1px solid var(--success-border)",
                      color: "var(--success-hover)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <CheckCircle2 style={{ width: "1rem", height: "1rem", color: "var(--success)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.6875rem", lineHeight: 1.4 }}>
                      Pembersihan pasta termal selesai, sedang pengujian performa beban.
                    </span>
                  </div>
                </div>

                <Link
                  href="/lacak/RMC-20261021-001"
                  className="btn btn-secondary btn-block"
                  style={{ borderRadius: "var(--radius-md)", padding: "0.625rem", fontSize: "0.8125rem" }}
                >
                  Buka Contoh Halaman Tracking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Langkah Workflow */}
      <section style={{ padding: "5rem 0", backgroundColor: "#ffffff" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Alur Pelayanan Baru
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              4 Langkah Mudah Servis di RimTech Comp
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Transformasi dari sistem lama yang serba spekulasi dan manual menuju sistem reservasi yang
              pasti, terstruktur, dan nyaman untuk pelanggan.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {workflow.map((item) => (
              <div
                key={item.step}
                className="card card-interactive"
                style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1.125rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(2, 132, 199, 0.3)",
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)", marginTop: "0.25rem" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog Layanan */}
      <section id="layanan" style={{ padding: "5rem 0", backgroundColor: "var(--bg-page)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Daftar Penanganan
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Layanan Spesialis Perbaikan Laptop
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Mulai dari keluhan hardware ringan hingga tingkat kerusakan motherboard berat ditangani
              dengan peralatan diagnosa standar laboratorium.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="card card-interactive"
                  style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.25rem" }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--primary-light)",
                          color: "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon style={{ width: "1.5rem", height: "1.5rem" }} />
                      </div>
                      <span className="badge badge-slate" style={{ fontSize: "0.6875rem" }}>
                        {s.badge}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{s.title}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                  <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <Link
                      href="/booking"
                      style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                    >
                      <span>Booking Layanan Ini</span>
                      <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ & Profil Toko */}
      <section id="faq" style={{ padding: "5rem 0", backgroundColor: "#ffffff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3.5rem" }}>
            {/* FAQ List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>FAQ</span>
                <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "0.25rem" }}>
                  Pertanyaan Sering Diajukan
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ padding: "1.25rem 1.5rem", borderRadius: "var(--radius-lg)", backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{faq.q}</h4>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profil Mitra Card */}
            <div>
              <div
                style={{
                  background: "linear-gradient(145deg, #0f172a 0%, #082f49 100%)",
                  color: "#ffffff",
                  borderRadius: "var(--radius-2xl)",
                  padding: "2rem",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary)", fontWeight: 700, display: "block", marginBottom: "0.25rem" }}>
                    Tentang Mitra Toko
                  </span>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff" }}>{STORE.name}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.5rem", lineHeight: 1.6 }}>
                    Unit usaha perbaikan laptop yang mengedepankan keterbukaan biaya, kualitas sparepart
                    berkualitas, dan jaminan pengerjaan dengan teknisi berpengalaman.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8125rem", color: "#cbd5e1", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", padding: "1.25rem 0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <MapPin style={{ width: "1rem", height: "1rem", color: "var(--primary)", flexShrink: 0, marginTop: "0.125rem" }} />
                    <div>
                      <strong style={{ color: "#ffffff", display: "block" }}>Alamat Toko:</strong>
                      <span>{STORE.address}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Clock style={{ width: "1rem", height: "1rem", color: "var(--primary)", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "#ffffff", display: "block" }}>Jam Buka:</strong>
                      <span>{STORE.hours}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Phone style={{ width: "1rem", height: "1rem", color: "var(--primary)", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "#ffffff", display: "block" }}>WhatsApp Resmi:</strong>
                      <span style={{ fontFamily: "var(--font-mono)" }}>+{STORE.whatsapp}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/booking"
                  className="btn btn-primary btn-block btn-lg"
                  style={{ boxShadow: "0 4px 15px rgba(2, 132, 199, 0.4)" }}
                >
                  Ajukan Jadwal Booking Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Laptop,
  Lock,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Proteksi Brute-Force: Cek apakah akun sedang dalam masa lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setErrorMsg(`Terlalu banyak percobaan gagal. Silakan tunggu ${remainingSeconds} detik.`);
      toast.error(`Akses ditangguhkan sementara (${remainingSeconds} dtk) demi keamanan.`);
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!res?.ok || res?.error) {
        const isDbError =
          res?.code === "database_unavailable" ||
          res?.error === "database_unavailable" ||
          res?.error?.toLowerCase().includes("database");

        if (isDbError) {
          setErrorMsg("Gagal terhubung ke database. Pastikan MySQL di Laragon sudah dijalankan (Start All).");
          toast.error("Database MySQL offline! Harap jalankan Laragon.");
        } else {
          const nextFailed = failedAttempts + 1;
          setFailedAttempts(nextFailed);

          if (nextFailed >= 5) {
            const lockTime = Date.now() + 60_000; // 60 detik lockout
            setLockoutUntil(lockTime);
            setErrorMsg("Terlalu banyak percobaan gagal. Form dikunci sementara selama 60 detik.");
            toast.error("Akses dikunci 60 detik karena 5x salah kata sandi.");
          } else {
            setErrorMsg(`Username atau kata sandi tidak cocok. Sisa percobaan: ${5 - nextFailed}.`);
            toast.error("Gagal masuk. Periksa kembali kredensial Anda.");
          }
        }
        setLoading(false);
      } else {
        setFailedAttempts(0);
        setLockoutUntil(null);
        toast.success("Berhasil masuk ke panel teknisi.");
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMsg("Terjadi gangguan server. Silakan coba kembali.");
      setLoading(false);
    }
  }

  function fillDemo() {
    setUsername("admin");
    setPassword("admin123");
    toast.info("Kredensial demo terisi otomatis.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2.5rem 1rem",
        backgroundColor: "#0f172a",
      }}
    >
      {/* Top back button */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 0.95rem",
            borderRadius: "9999px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            color: "#94a3b8",
            fontSize: "0.8125rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#334155";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1e293b";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Login Card Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#1e293b",
          borderRadius: "1.25rem",
          border: "1px solid #334155",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
          padding: "2.5rem 2rem",
        }}
      >
        {/* Header inside the card */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "1rem",
              background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              marginBottom: "1rem",
            }}
          >
            <Laptop style={{ width: "1.75rem", height: "1.75rem" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              RimTech
            </span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8", letterSpacing: "-0.02em" }}>
              Comp
            </span>
          </div>

          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 0.35rem 0" }}>
            Panel Pengelola & Teknisi
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
            Kelola antrean booking, kuota harian, serta pembaruan progres servis laptop secara real-time.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              backgroundColor: "rgba(225, 29, 72, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fda4af",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle style={{ width: "1.125rem", height: "1.125rem", flexShrink: 0, color: "#fb7185" }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#cbd5e1",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.5rem",
              }}
            >
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User
                style={{
                  width: "1.125rem",
                  height: "1.125rem",
                  color: "#64748b",
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.875rem 0.75rem 2.625rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14, 165, 233, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#334155";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#cbd5e1",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                style={{
                  width: "1.125rem",
                  height: "1.125rem",
                  color: "#64748b",
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="password"
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.875rem 0.75rem 2.625rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14, 165, 233, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#334155";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.875rem 1.25rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "linear-gradient(135deg, #0369a1 0%, #0891b2 100%)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(2, 132, 199, 0.45)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(2, 132, 199, 0.35)";
                e.currentTarget.style.transform = "none";
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: "1.125rem", height: "1.125rem", animation: "spin 1s linear infinite" }} />
                <span>Memverifikasi Sesi...</span>
              </>
            ) : (
              <>
                <ShieldCheck style={{ width: "1.125rem", height: "1.125rem" }} />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Account Quick-Fill Card (HANYA tampil pada mode Development, disembunyikan di Production) */}
        {process.env.NODE_ENV !== "production" && (
          <div
            style={{
              marginTop: "1.75rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "0.875rem",
                padding: "0.875rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <KeyRound style={{ width: "0.875rem", height: "0.875rem", color: "#38bdf8" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8" }}>
                  Akun Default (Seeder Database):
                </span>
              </div>

              <button
                type="button"
                onClick={fillDemo}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.45rem 0.875rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  color: "#7dd3fc",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono, monospace)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#334155";
                  e.currentTarget.style.borderColor = "#38bdf8";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1e293b";
                  e.currentTarget.style.borderColor = "#475569";
                  e.currentTarget.style.color = "#7dd3fc";
                }}
              >
                <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
                <span>admin / admin123 (Isi Otomatis)</span>
              </button>
            </div>
          </div>
        )}

        {/* Security badge at footer */}
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
            fontSize: "0.6875rem",
            color: "#64748b",
          }}
        >
          <CheckCircle2 style={{ width: "0.75rem", height: "0.75rem", color: "#059669" }} />
          <span>Tersertifikasi Enkripsi Bcrypt & HTTP-Only Cookie</span>
        </div>
      </div>
    </div>
  );
}

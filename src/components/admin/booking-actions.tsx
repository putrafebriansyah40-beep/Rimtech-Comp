"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  confirmBookingAction,
  rejectBookingAction,
} from "@/lib/actions/admin";

export function ConfirmBookingButton({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await confirmBookingAction(bookingId);
      if (res.success) {
        toast.success("Booking berhasil dikonfirmasi! Pesan WhatsApp telah dikirim.");
        setShowModal(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengonfirmasi booking");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem saat konfirmasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setShowModal(true)}
        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Konfirmasi</span>
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1.25rem",
              maxWidth: "24rem",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#059669" }}>
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 style={{ width: "1.35rem", height: "1.35rem", color: "#059669" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", margin: 0 }}>
                  Konfirmasi Booking?
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Jadwal penyerahan unit disetujui
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
              Status booking akan diubah menjadi <strong>DIKONFIRMASI</strong> dan sistem otomatis mengirimkan pesan konfirmasi WhatsApp resmi kepada pelanggan.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.5rem" }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#475569",
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  backgroundColor: "#059669",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.3)",
                }}
              >
                {loading ? <Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 1s linear infinite" }} /> : <Check style={{ width: "0.875rem", height: "0.875rem" }} />}
                <span>{loading ? "Memproses..." : "Ya, Konfirmasi"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function RejectBookingModal({
  bookingId,
  bookingCode,
}: {
  bookingId: number;
  bookingCode: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await rejectBookingAction({ bookingId, reason });
      if (res.success) {
        toast.success(`Booking ${bookingCode} ditolak. Notifikasi WhatsApp dikirim.`);
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menolak booking");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem saat penolakan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-all flex items-center gap-1"
      >
        <X className="w-3.5 h-3.5" />
        <span>Tolak</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1.25rem",
              maxWidth: "28rem",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#e11d48" }}>
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#ffe4e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle style={{ width: "1.35rem", height: "1.35rem", color: "#e11d48" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", margin: 0 }}>
                  Tolak Booking
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                  {bookingCode}
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
              Kuota slot harian akan dikembalikan secara otomatis. Masukkan alasan penolakan yang akan diteruskan ke pelanggan via WhatsApp.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Alasan Penolakan <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Sparepart tipe motherboard ini diskontinu / Toko mendadak tutup karena keperluan teknisi..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#475569",
                    backgroundColor: "#f1f5f9",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#dc2626",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.3)",
                  }}
                >
                  {loading ? <Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 1s linear infinite" }} /> : null}
                  <span>Tolak & Kirim WA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

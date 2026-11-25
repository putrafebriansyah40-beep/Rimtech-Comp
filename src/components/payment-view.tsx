"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";

type PaymentProps = {
  bookingCode: string;
  invoiceNumber: string;
  amount: number;
  qrDataUrlString: string | null;
  qrisString?: string | null;
  expiresAt: string | null;
  isSimulation: boolean;
  laptopName: string;
};

export function PaymentView({
  bookingCode,
  invoiceNumber,
  amount,
  qrDataUrlString,
  qrisString,
  expiresAt,
  isSimulation,
  laptopName,
}: PaymentProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(false);
  const [simulating, setSimulating] = useState(false);

  function copyQrisText() {
    if (!qrisString) return;
    navigator.clipboard.writeText(qrisString);
    setCopiedQr(true);
    toast.success("Kode QRIS berhasil disalin!");
    setTimeout(() => setCopiedQr(false), 2500);
  }

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Polling payment status every 3s
  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/booking/${bookingCode}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.paymentStatus === "SETTLEMENT" || data.bookingStatus !== "MENUNGGU_PEMBAYARAN") {
          toast.success("Pembayaran terverifikasi!");
          router.push(`/booking/${bookingCode}/sukses`);
        }
      } catch {
        // quiet error during poll
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingCode, isExpired, router]);

  async function checkManual() {
    setChecking(true);
    try {
      const res = await fetch(`/api/booking/${bookingCode}/status`);
      const data = await res.json();
      if (data.paymentStatus === "SETTLEMENT" || data.bookingStatus !== "MENUNGGU_PEMBAYARAN") {
        toast.success("Pembayaran terverifikasi!");
        router.push(`/booking/${bookingCode}/sukses`);
      } else {
        toast.info("Pembayaran belum terdeteksi. Silakan selesaikan scan di e-wallet Anda.");
      }
    } catch {
      toast.error("Gagal memeriksa status.");
    } finally {
      setChecking(false);
    }
  }

  async function simulatePayment() {
    setSimulating(true);
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode }),
      });
      if (res.ok) {
        toast.success("Simulasi sukses! Pembayaran berhasil diterima.");
        router.push(`/booking/${bookingCode}/sukses`);
      } else {
        const d = await res.json();
        toast.error(d.error || "Simulasi gagal");
      }
    } catch {
      toast.error("Gagal menjalankan simulasi");
    } finally {
      setSimulating(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    toast.success("Kode booking disalin!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Banner Simulation Info */}
      {isSimulation && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-semibold block text-amber-950">Mode Simulasi Aktif</strong>
              <span>Kunci Midtrans belum diisi di .env. Anda dapat langsung klik tombol simulasi di bawah.</span>
            </div>
          </div>
          <button
            type="button"
            disabled={simulating || isExpired}
            onClick={simulatePayment}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-xs shrink-0 disabled:opacity-50"
          >
            {simulating ? "Memproses..." : "⚡ Bayar Sekarang (Simulasi)"}
          </button>
        </div>
      )}

      {/* Main Payment Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold block mb-1">
                Tagihan Uang Muka (DP) Servis
              </span>
              <h2 className="text-2xl font-bold text-white">Pembayaran via QRIS</h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                <span>{laptopName}</span>
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">Total Nominal DP</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {formatRupiah(amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-500 block">Kode Booking:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 mt-0.5">
                <span>{bookingCode}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                  title="Salin kode"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block">Nomor Invoice:</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block">{invoiceNumber}</span>
            </div>
          </div>

          {/* Countdown Warning */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              isExpired
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-sky-50 border-sky-200 text-sky-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {isExpired ? "Batas waktu pembayaran telah habis." : "Selesaikan pembayaran dalam:"}
              </span>
            </div>
            <span className="font-mono font-bold text-sm tracking-widest">{timeLeft}</span>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center py-4">
            {isExpired ? (
              <div className="p-8 text-center space-y-2">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Tagihan Kedaluwarsa</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Slot reservasi telah dilepas secara otomatis. Silakan ajukan booking baru untuk memilih jadwal.
                </p>
                <div className="pt-2">
                  <a
                    href="/booking"
                    className="inline-block px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs"
                  >
                    Booking Ulang
                  </a>
                </div>
              </div>
            ) : qrDataUrlString ? (
              <div className="space-y-4 text-center">
                <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                  <Image
                    src={qrDataUrlString}
                    alt="QRIS Code"
                    width={260}
                    height={260}
                    className="rounded-lg mx-auto"
                    priority
                  />
                  <div className="mt-2 text-[11px] font-bold text-slate-600 tracking-wider">
                    QRIS DINAMIS • STANDAR NASIONAL
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Buka aplikasi mobile banking atau dompet digital Anda, pilih <strong>Scan QRIS</strong>, lalu
                  arahkan kamera ke kode di atas.
                </p>

                {/* Sandbox Helper (Agar tidak error unparsable saat scan layar) */}
                {!isSimulation && qrisString && (
                  <div className="mt-4 p-4 rounded-2xl bg-sky-50/90 border border-sky-200 text-left space-y-2.5 shadow-xs max-w-md mx-auto">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <span>Pengujian Sandbox (Midtrans Simulator)</span>
                      </span>
                      <a
                        href="https://simulator.sandbox.midtrans.com/qris/index"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline"
                      >
                        Buka Simulator ↗
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Kamera laptop/webcam sering buram saat scan layar (menghasilkan <em>unparsable</em>). Anda dapat langsung menyalin kode QRIS di bawah lalu tempelkan ke kolom Simulator Midtrans:
                    </p>
                    <button
                      type="button"
                      onClick={copyQrisText}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-sky-600" />
                      <span>{copiedQr ? "Kode QRIS Berhasil Disalin!" : "Salin Kode QRIS String"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Kode QRIS sedang disiapkan...</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isExpired && (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={checkManual}
                disabled={checking}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                <span>{checking ? "Memeriksa Status..." : "Saya Sudah Bayar (Cek Status)"}</span>
              </button>

              {isSimulation && (
                <button
                  type="button"
                  onClick={simulatePayment}
                  disabled={simulating}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simulasi Bayar Berhasil (Demo)</span>
                </button>
              )}
            </div>
          )}

          {/* Instructions Accordion / List */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h5 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Cara Pembayaran:
            </h5>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
              <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
              <li>Pilih menu <strong>Bayar / QRIS / Scan</strong>.</li>
              <li>Arahkan kamera ke kode QRIS di atas.</li>
              <li>Pastikan nama merchant adalah <strong>RimTech Comp</strong> dengan nominal <strong>{formatRupiah(amount)}</strong>.</li>
              <li>Konfirmasi pembayaran dengan PIN Anda. Sistem otomatis mendeteksi tanpa perlu kirim bukti transfer.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

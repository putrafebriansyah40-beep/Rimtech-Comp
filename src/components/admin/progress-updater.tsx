"use client";

import React, { useState } from "react";
import {
  Wrench,
  CheckCircle2,
  Loader2,
  CreditCard,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { updateProgressAction, settleOfflineAction } from "@/lib/actions/admin";
import { ADMIN_PROGRESS_OPTIONS, SERVICE_STATUS } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type { ServiceStatus } from "@prisma/client";

export function ProgressUpdater({
  bookingId,
  currentStatus,
  dpPaid,
  finalCost,
  remainingCost,
  isFinished,
}: {
  bookingId: number;
  currentStatus: ServiceStatus;
  dpPaid: number;
  finalCost: number | null;
  remainingCost: number | null;
  isFinished: boolean;
}) {
  const [status, setStatus] = useState<ServiceStatus>(
    currentStatus === "MENUNGGU_PENYERAHAN" ? "SEDANG_DIDIAGNOSA" : currentStatus
  );
  const [notes, setNotes] = useState("");
  const [totalCostInput, setTotalCostInput] = useState<number>(finalCost || dpPaid);
  const [loading, setLoading] = useState(false);

  // Modal Pelunasan Offline
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleMethod, setSettleMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [settleLoading, setSettleLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await updateProgressAction({
      bookingId,
      status: status as "SEDANG_DIDIAGNOSA" | "SEDANG_DIPERBAIKI" | "MENUNGGU_SPAREPART" | "SELESAI",
      notes: notes.trim() || undefined,
      finalCost: status === "SELESAI" ? Number(totalCostInput) : undefined,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Status progres perbaikan berhasil diperbarui!");
      setNotes("");
    } else {
      toast.error(res.error || "Gagal memperbarui status");
    }
  }

  async function handleSettle(e: React.FormEvent) {
    e.preventDefault();
    setSettleLoading(true);

    const res = await settleOfflineAction({
      bookingId,
      method: settleMethod,
    });
    setSettleLoading(false);

    if (res.success) {
      toast.success("Pelunasan berhasil dicatat! Unit resmi diserahkan ke pelanggan.");
      setSettleModalOpen(false);
    } else {
      toast.error(res.error || "Gagal mencatat pelunasan");
    }
  }

  if (isFinished) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PackageCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">Servis Selesai & Unit Telah Diambil</strong>
            <span>Seluruh kewajiban pembayaran telah lunas dan unit diserahkan ke pelanggan.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Update Progres */}
      <form onSubmit={handleUpdate} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-sky-600" />
            <span>Perbarui Status Pengerjaan Laptop</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Status saat ini: <strong>{SERVICE_STATUS[currentStatus]?.label || currentStatus}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Status Progres Baru
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ServiceStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {ADMIN_PROGRESS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {SERVICE_STATUS[opt]?.label || opt}
                </option>
              ))}
            </select>
          </div>

          {status === "SELESAI" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Biaya Akhir Perbaikan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={dpPaid}
                step={5000}
                required
                value={totalCostInput}
                onChange={(e) => setTotalCostInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                DP Rp {dpPaid.toLocaleString("id-ID")} akan dipotong otomatis. Sisa pelunasan di toko:{" "}
                <strong>Rp {Math.max(0, totalCostInput - dpPaid).toLocaleString("id-ID")}</strong>
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Catatan Teknis Progres (Dapat dilihat pelanggan di halaman tracking)
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Komponen IC power diganti baru, sedang tahap stress-test stabilitas 2 jam..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Simpan Perubahan Status</span>
          </button>
        </div>
      </form>

      {/* Button Catat Pelunasan Offline (Hanya jika status SELESAI dan sisa > 0 atau menunggu ambil) */}
      {currentStatus === "SELESAI" && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-950 text-sm">Servis Sudah Selesai Diperbaiki</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Sisa pelunasan pelanggan di toko:{" "}
              <strong>{formatRupiah(remainingCost || 0)}</strong>. Klik tombol berikut setelah pelanggan datang
              mengambil unit dan melunasi sisa biaya.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Catat Pelunasan & Serah Terima</span>
          </button>
        </div>
      )}

      {/* Modal Pelunasan Offline */}
      {settleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pelunasan & Serah Terima Unit</h3>
                <span className="text-xs text-slate-500">Penyelesaian akhir transaksi perbaikan</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Biaya Akhir:</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(finalCost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DP Terbayar (QRIS):</span>
                <span className="font-mono text-emerald-700">-{formatRupiah(dpPaid)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                <span className="text-slate-900">Sisa Pelunasan di Toko:</span>
                <span className="font-mono text-amber-600 text-sm">{formatRupiah(remainingCost || 0)}</span>
              </div>
            </div>

            <form onSubmit={handleSettle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Metode Pembayaran Pelunasan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleMethod("CASH")}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      settleMethod === "CASH"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    💵 Tunai (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMethod("TRANSFER")}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      settleMethod === "TRANSFER"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    💳 Transfer Bank
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={settleLoading}
                  onClick={() => setSettleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={settleLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {settleLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Konfirmasi Lunas & Diambil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

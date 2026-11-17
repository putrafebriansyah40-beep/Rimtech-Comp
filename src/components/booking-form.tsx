"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  User,
  Phone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { LAPTOP_BRANDS, DROP_OFF_TIMES } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import { formatDateID } from "@/lib/dates";

type SlotInfo = {
  date: string;
  maxCapacity: number;
  booked: number;
  remaining: number;
  isOpen: boolean;
  notes: string | null;
};

export function BookingForm({ dpAmount }: { dpAmount: number }) {
  const router = useRouter();
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: "",
    email: "",
    laptopBrand: "Asus",
    laptopModel: "",
    issueDescription: "",
    dropOffDate: "",
    dropOffTime: "10:00" as (typeof DROP_OFF_TIMES)[number],
  });

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch("/api/slots");
        const json = await res.json();
        if (json.slots) {
          setSlots(json.slots);
          const firstOpen = json.slots.find((s: SlotInfo) => s.isOpen && s.remaining > 0);
          if (firstOpen) {
            setFormData((prev) => ({ ...prev, dropOffDate: firstOpen.date }));
          }
        }
      } catch (err) {
        console.error("Gagal memuat slot", err);
        toast.error("Gagal memuat ketersediaan tanggal");
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, []);

  const selectedSlot = slots.find((s) => s.date === formData.dropOffDate);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (!formData.dropOffDate) {
      toast.error("Silakan pilih tanggal pengantaran unit");
      return;
    }
    if (selectedSlot && (!selectedSlot.isOpen || selectedSlot.remaining <= 0)) {
      toast.error("Tanggal yang dipilih tidak tersedia atau kuota sudah penuh.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          toast.error(data.error || "Terdapat kesalahan pengisian data.");
        } else {
          toast.error(data.error || "Gagal membuat booking.");
        }
        setSubmitting(false);
        return;
      }

      toast.success("Booking berhasil diajukan! Mengalihkan ke pembayaran DP...");
      router.push(`/booking/${data.bookingCode}/bayar`);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kendala jaringan. Silakan coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Pilih Tanggal & Kuota */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Pilih Tanggal Pengantaran Unit</h3>
            <p className="text-xs text-slate-500">
              Sistem kuota harian memastikan laptop Anda langsung ditangani teknisi tanpa antre lama.
            </p>
          </div>
        </div>

        {loadingSlots ? (
          <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
            <span>Memeriksa ketersediaan kalender...</span>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 max-h-72 overflow-y-auto p-1">
              {slots.map((s) => {
                const isSelected = formData.dropOffDate === s.date;
                const isAvailable = s.isOpen && s.remaining > 0;
                return (
                  <button
                    key={s.date}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setFormData({ ...formData, dropOffDate: s.date });
                      setFieldErrors((prev) => ({ ...prev, dropOffDate: "" }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-xs"
                        : isAvailable
                        ? "border-slate-200 hover:border-sky-300 hover:bg-slate-50/80 bg-white"
                        : "border-slate-100 bg-slate-50/70 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 uppercase">
                        {new Intl.DateTimeFormat("id-ID", {
                          weekday: "short",
                          timeZone: "UTC",
                        }).format(new Date(`${s.date}T00:00:00Z`))}
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          timeZone: "UTC",
                        }).format(new Date(`${s.date}T00:00:00Z`))}
                      </div>
                    </div>
                    <div className="text-[10px] font-medium">
                      {!s.isOpen ? (
                        <span className="text-rose-600 font-semibold">Toko Libur</span>
                      ) : s.remaining <= 0 ? (
                        <span className="text-amber-700 font-semibold">Penuh</span>
                      ) : (
                        <span className="text-emerald-700">Sisa {s.remaining} slot</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedSlot && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>
                    Terpilih: <strong>{formatDateID(selectedSlot.date)}</strong>
                  </span>
                </span>
                <span className="text-slate-500">
                  Kapasitas harian: {selectedSlot.booked} / {selectedSlot.maxCapacity} unit
                </span>
              </div>
            )}
            {fieldErrors.dropOffDate && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.dropOffDate}
              </p>
            )}
          </div>
        )}

        {/* Jam Pengantaran */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Jam Pengantaran ke Toko
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DROP_OFF_TIMES.map((time) => {
              const isSelected = formData.dropOffTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({ ...formData, dropOffTime: time })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    isSelected
                      ? "border-sky-600 bg-sky-600 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-slate-50"
                  }`}
                >
                  {time} WIB
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Informasi Laptop */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Informasi Laptop & Keluhan Kerusakan</h3>
            <p className="text-xs text-slate-500">
              Jelaskan kondisi unit sedetail mungkin untuk memudahkan teknisi menyiapkan diagnosa & sparepart.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Merek Laptop <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.laptopBrand}
              onChange={(e) => setFormData({ ...formData, laptopBrand: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {LAPTOP_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipe / Seri Model Laptop <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Asus ROG Strix G15 / Lenovo Slim 3"
              value={formData.laptopModel}
              onChange={(e) => {
                setFormData({ ...formData, laptopModel: e.target.value });
                setFieldErrors((prev) => ({ ...prev, laptopModel: "" }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
              required
            />
            {fieldErrors.laptopModel && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.laptopModel}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Deskripsi Keluhan Kerusakan <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Laptop tiba-tiba mati setelah kena air, lampu indikator charger berkedip, tidak mau menyala sama sekali..."
            value={formData.issueDescription}
            onChange={(e) => {
              setFormData({ ...formData, issueDescription: e.target.value });
              setFieldErrors((prev) => ({ ...prev, issueDescription: "" }));
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
            required
          />
          {fieldErrors.issueDescription && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.issueDescription}
            </p>
          )}
        </div>
      </div>

      {/* 3. Data Pelanggan */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Identitas Pelanggan</h3>
            <p className="text-xs text-slate-500">
              Nomor WhatsApp digunakan untuk mengirim notifikasi konfirmasi booking dan pemberitahuan laptop selesai.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Nama Anda"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="081234567890"
                value={formData.whatsappNumber}
                onChange={(e) => {
                  setFormData({ ...formData, whatsappNumber: e.target.value });
                  setFieldErrors((prev) => ({ ...prev, whatsappNumber: "" }));
                }}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                required
              />
            </div>
            {fieldErrors.whatsappNumber && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.whatsappNumber}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email <span className="text-slate-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* 4. Rincian DP & Ketentuan */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Komitmen Reservasi Servis</span>
            </div>
            <h4 className="text-xl font-bold text-white">Pembayaran Uang Muka (DP) QRIS</h4>
            <p className="text-xs text-slate-300 mt-1">
              Sebagai tanda jadi dan pemotongan otomatis dari total biaya perbaikan akhir di toko.
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block">Nominal DP</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatRupiah(dpAmount)}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Kode QRIS dinamis langsung muncul setelah Anda menekan tombol di bawah.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Bisa dibayar dengan BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, Dana, ShopeePay, dsb.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Jika booking ditolak oleh teknisi, DP dapat dikembalikan 100%.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-base shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Booking & Invoice QRIS...</span>
            </>
          ) : (
            <>
              <span>Lanjut ke Pembayaran DP QRIS</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

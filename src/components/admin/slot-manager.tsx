"use client";

import React, { useState } from "react";
import {
  Calendar,
  Edit2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { saveSlotAction } from "@/lib/actions/admin";
import { formatDateID } from "@/lib/dates";
import type { SlotAvailability } from "@/lib/services/slot";

export function SlotManager({ initialSlots }: { initialSlots: SlotAvailability[] }) {
  const [slots, setSlots] = useState(initialSlots);
  const [editingSlot, setEditingSlot] = useState<SlotAvailability | null>(null);
  const [maxCapacity, setMaxCapacity] = useState(5);
  const [isOpen, setIsOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(slot: SlotAvailability) {
    setEditingSlot(slot);
    setMaxCapacity(slot.maxCapacity);
    setIsOpen(slot.isOpen);
    setNotes(slot.notes || "");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSlot) return;

    setLoading(true);
    const res = await saveSlotAction({
      date: editingSlot.date,
      maxCapacity,
      isStoreOpen: isOpen,
      notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      toast.success(`Jadwal tanggal ${editingSlot.date} berhasil diperbarui!`);
      setSlots((prev) =>
        prev.map((s) =>
          s.date === editingSlot.date
            ? {
                ...s,
                maxCapacity,
                isOpen,
                notes: notes.trim() || null,
                remaining: Math.max(0, maxCapacity - s.booked),
                configured: true,
              }
            : s
        )
      );
      setEditingSlot(null);
    } else {
      toast.error(res.error || "Gagal menyimpan pengaturan slot");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slots.map((s) => {
          const isFull = s.remaining <= 0 && s.isOpen;
          return (
            <div
              key={s.date}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-44 ${
                !s.isOpen
                  ? "bg-rose-50/50 border-rose-200"
                  : isFull
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" }).format(
                        new Date(`${s.date}T00:00:00Z`)
                      )}
                    </span>
                    <strong className="text-sm font-bold text-slate-900">
                      {formatDateID(s.date, { day: "numeric", month: "short", year: "numeric" })}
                    </strong>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {s.isOpen ? "BUKA" : "LIBUR"}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Terbooking:</span>
                    <strong className="text-slate-900 font-mono">
                      {s.booked} / {s.maxCapacity} unit
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Sisa Kuota:</span>
                    <strong
                      className={`font-mono ${
                        !s.isOpen
                          ? "text-slate-400"
                          : s.remaining > 0
                          ? "text-emerald-700"
                          : "text-rose-600 font-bold"
                      }`}
                    >
                      {!s.isOpen ? "-" : `${s.remaining} slot`}
                    </strong>
                  </div>
                  {s.notes && (
                    <p className="text-[11px] text-slate-500 italic truncate pt-1">{s.notes}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {s.configured ? "Diatur Manual" : "Default Sistem"}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-slate-500" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Atur Kuota & Kalender Toko</h3>
                <span className="text-xs text-slate-500">
                  {formatDateID(editingSlot.date)} ({editingSlot.date})
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Status Toko Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Status Operasional Toko
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      isOpen
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Toko Buka
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      !isOpen
                        ? "border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Toko Libur / Tutup
                  </button>
                </div>
              </div>

              {/* Max Capacity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Batas Kapasitas Maksimal Servis (Unit)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Saat ini sudah ada <strong>{editingSlot.booked} unit</strong> terbooking pada tanggal ini.
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Toko libur - acara keluarga / Buka setengah hari..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

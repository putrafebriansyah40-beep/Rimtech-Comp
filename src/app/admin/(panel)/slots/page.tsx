import React from "react";
import { AdminHeader } from "@/components/admin/header";
import { SlotManager } from "@/components/admin/slot-manager";
import { getAvailability } from "@/lib/services/slot";
import { todayISO, addDaysISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminSlotsPage() {
  const today = todayISO();
  const slots = await getAvailability(today, addDaysISO(today, 30));

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Pengaturan Kuota Slot & Kalender Toko (FR-10)" />

      <main className="p-6 sm:p-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">Kalender Operasional 30 Hari Ke Depan</h3>
          <p className="text-xs text-slate-500">
            Anda dapat membatasi kuota harian maksimal unit servis atau menandai hari libur khusus toko
            agar pelanggan tidak dapat memilih tanggal tersebut saat booking online.
          </p>
        </div>

        <SlotManager initialSlots={slots} />
      </main>
    </div>
  );
}

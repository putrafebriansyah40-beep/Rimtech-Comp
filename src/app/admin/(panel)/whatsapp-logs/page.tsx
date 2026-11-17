import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { WhatsappBadge } from "@/components/ui/status-badge";
import { ResendWhatsappButton } from "@/components/admin/resend-whatsapp-button";
import { formatDateTimeWIB } from "@/lib/dates";
import { ArrowUpRight } from "lucide-react";
import { isWhatsappSimulation } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminWhatsappLogsPage() {
  const logs = await prisma.whatsappLog.findMany({
    include: {
      booking: {
        include: { customer: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const isSim = isWhatsappSimulation();

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Log Notifikasi Otomatis WhatsApp (FR-12)" />

      <main className="p-6 sm:p-8 space-y-6">
        {/* Simulation info */}
        {isSim && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-center justify-between">
            <div>
              <strong className="block font-bold">Mode Simulasi WhatsApp Aktif</strong>
              <span className="text-slate-600">
                Token Fonnte belum diisi di .env. Pesan otomatis tetap dicatat rapi di database lokal dan
                dapat ditinjau pada tabel di bawah.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-200 text-sky-800 font-semibold text-[11px] shrink-0">
              Simulasi Lokal
            </span>
          </div>
        )}

        {/* Table of Logs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Pengiriman Pesan (Terbaru 100)</h3>
            <span className="text-xs text-slate-400">Total: {logs.length} log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Tipe Pesan</th>
                  <th className="py-3 px-4">Tujuan / Pelanggan</th>
                  <th className="py-3 px-4">Isi Pesan WhatsApp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Belum ada pesan WhatsApp yang dikirimkan.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDateTimeWIB(log.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {log.messageType}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <strong className="text-slate-900 block font-mono">
                          +{log.recipientNumber}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {log.booking.customer.fullName} ({log.booking.bookingCode})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {log.messageBody}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <WhatsappBadge status={log.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <ResendWhatsappButton logId={log.id} />
                          <Link
                            href={`/admin/bookings/${log.bookingId}`}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Buka Booking"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

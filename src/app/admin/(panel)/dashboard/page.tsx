import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { ServiceBadge } from "@/components/ui/status-badge";
import { formatRupiah, toNumber } from "@/lib/utils";
import { formatDateID, dateToTime, todayISO, isoToDate } from "@/lib/dates";
import {
  Inbox,
  Wrench,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = todayISO();

  // Metrics
  const [
    pendingConfirmCount,
    inProgressCount,
    readyCount,
    payments,
    urgentBookings,
    activeBookings,
    todaySlot,
  ] = await Promise.all([
    prisma.booking.count({ where: { bookingStatus: "MENUNGGU_KONFIRMASI" } }),
    prisma.booking.count({
      where: {
        bookingStatus: "DIKONFIRMASI",
        serviceLogs: {
          some: {
            status: { in: ["SEDANG_DIDIAGNOSA", "SEDANG_DIPERBAIKI", "MENUNGGU_SPAREPART"] },
          },
        },
      },
    }),
    prisma.booking.count({
      where: {
        bookingStatus: "DIKONFIRMASI",
        serviceLogs: {
          some: { status: "SELESAI" },
        },
      },
    }),
    prisma.payment.findMany({
      where: { paymentStatus: "SETTLEMENT" },
      select: { amount: true },
    }),
    prisma.booking.findMany({
      where: { bookingStatus: "MENUNGGU_KONFIRMASI" },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { bookingStatus: "DIKONFIRMASI" },
      include: {
        customer: true,
        serviceLogs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.dailySlot.findUnique({
      where: { slotDate: isoToDate(today) },
    }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Dashboard Ringkasan Operasional" />

      <main className="p-6 sm:p-8 space-y-8">
        {/* Slot info bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>
              Operasional Hari Ini (<strong>{formatDateID(today)}</strong>):{" "}
              {todaySlot?.isStoreOpen ?? true ? (
                <span className="text-emerald-700 font-bold">TOKO BUKA</span>
              ) : (
                <span className="text-rose-600 font-bold">TOKO LIBUR</span>
              )}
            </span>
          </div>
          <div className="text-slate-500">
            Terisi: <strong>{todaySlot?.currentBooked ?? 0}</strong> dari kapasitas{" "}
            <strong>{todaySlot?.maxCapacity ?? 5} unit</strong>
          </div>
        </div>

        {/* 4 Cards Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Menunggu Konfirmasi */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Menunggu Konfirmasi</span>
              <span className="text-3xl font-extrabold text-amber-600 mt-1 block">
                {pendingConfirmCount}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Booking baru masuk</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
          </div>

          {/* 2. Sedang Dikerjakan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Sedang Dikerjakan</span>
              <span className="text-3xl font-extrabold text-sky-600 mt-1 block">
                {inProgressCount}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Diagnosa & reparasi</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          {/* 3. Selesai Siap Ambil */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Siap Diambil</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">
                {readyCount}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Menunggu pelunasan</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* 4. Total Pemasukan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Omzet Masuk</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block font-mono">
                {formatRupiah(totalRevenue)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">DP + Pelunasan Tunai/Trf</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2 Grid Tables: Urgent Bookings & Active Repairs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Urgent: Menunggu Konfirmasi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Booking Menunggu Konfirmasi</h3>
                <p className="text-xs text-slate-500">Periksa dan setujui jadwal yang diajukan pelanggan</p>
              </div>
              <Link
                href="/admin/bookings?status=MENUNGGU_KONFIRMASI"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {urgentBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Semua booking masuk sudah dikonfirmasi. Tidak ada antrean pending.
              </div>
            ) : (
              <div className="space-y-3">
                {urgentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{b.bookingCode}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-700">{b.customer.fullName}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {b.laptopBrand} {b.laptopModel} — Antar: {formatDateID(b.dropOffDate, { day: "numeric", month: "short" })} ({dateToTime(b.dropOffTime)} WIB)
                      </div>
                    </div>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] shrink-0 transition-colors"
                    >
                      Tinjau
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active: Sedang Dikerjakan */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Unit Sedang Dalam Pengerjaan</h3>
                <p className="text-xs text-slate-500">Pembaruan progres fisik teknisi</p>
              </div>
              <Link
                href="/admin/bookings?status=DIKONFIRMASI"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada unit yang sedang dikerjakan saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => {
                  const currentStatus = b.serviceLogs[0]?.status ?? "MENUNGGU_PENYERAHAN";
                  return (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{b.bookingCode}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium text-slate-700">{b.customer.fullName}</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {b.laptopBrand} {b.laptopModel}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ServiceBadge status={currentStatus} />
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Detail"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

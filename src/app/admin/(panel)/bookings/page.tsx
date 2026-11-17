import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { BookingBadge, ServiceBadge } from "@/components/ui/status-badge";
import { ConfirmBookingButton, RejectBookingModal } from "@/components/admin/booking-actions";
import { formatDateID, dateToTime } from "@/lib/dates";
import type { BookingStatus, Prisma } from "@prisma/client";
import { Search, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminBookingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const qParam = typeof searchParams.q === "string" ? searchParams.q : "";

  const filterStatus = statusParam && statusParam !== "ALL" ? (statusParam as BookingStatus) : undefined;
  const searchQuery = qParam.trim();

  const whereClause: Prisma.BookingWhereInput = {
    ...(filterStatus ? { bookingStatus: filterStatus } : {}),
    ...(searchQuery
      ? {
          OR: [
            { bookingCode: { contains: searchQuery } },
            { laptopBrand: { contains: searchQuery } },
            { laptopModel: { contains: searchQuery } },
            { customer: { fullName: { contains: searchQuery } } },
            { customer: { whatsappNumber: { contains: searchQuery } } },
          ],
        }
      : {}),
  };

  const [bookings, statusCounts] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        payments: true,
        serviceLogs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.groupBy({
      by: ["bookingStatus"],
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(statusCounts.map((s) => [s.bookingStatus, s._count._all]));
  const totalCount = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

  const tabs: { label: string; value: string; count: number }[] = [
    { label: "Semua", value: "ALL", count: totalCount },
    {
      label: "Menunggu Konfirmasi",
      value: "MENUNGGU_KONFIRMASI",
      count: countMap["MENUNGGU_KONFIRMASI"] ?? 0,
    },
    { label: "Dikonfirmasi", value: "DIKONFIRMASI", count: countMap["DIKONFIRMASI"] ?? 0 },
    { label: "Selesai", value: "SELESAI", count: countMap["SELESAI"] ?? 0 },
    { label: "Ditolak", value: "DITOLAK", count: countMap["DITOLAK"] ?? 0 },
  ];

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Manajemen Antrean Booking & Servis" />

      <main className="p-6 sm:p-8 space-y-6">
        {/* Filter Tabs & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {tabs.map((tab) => {
                const isActive = (filterStatus === undefined && tab.value === "ALL") || filterStatus === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={`/admin/bookings?status=${tab.value}${searchQuery ? `&q=${searchQuery}` : ""}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Search Input Form */}
            <form method="GET" action="/admin/bookings" className="relative w-full sm:w-72">
              {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Cari kode, nama, laptop..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
              />
            </form>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode Booking</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Perangkat & Keluhan</th>
                  <th className="py-3 px-4">Jadwal Antar</th>
                  <th className="py-3 px-4">Status Booking</th>
                  <th className="py-3 px-4">Progres Servis</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada data booking yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const currentService = b.serviceLogs[0]?.status ?? "MENUNGGU_PENYERAHAN";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Kode */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <Link
                            href={`/admin/bookings/${b.id}`}
                            className="text-sky-600 hover:text-sky-700 hover:underline"
                          >
                            {b.bookingCode}
                          </Link>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-semibold">{b.customer.fullName}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            +{b.customer.whatsappNumber}
                          </span>
                        </td>

                        {/* Laptop */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-semibold text-slate-800 block">
                            {b.laptopBrand} {b.laptopModel}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {b.issueDescription}
                          </span>
                        </td>

                        {/* Jadwal */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {formatDateID(b.dropOffDate, { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {dateToTime(b.dropOffTime)} WIB
                          </div>
                        </td>

                        {/* Status Booking */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <BookingBadge status={b.bookingStatus} />
                        </td>

                        {/* Progres Fisik */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <ServiceBadge status={currentService} />
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.bookingStatus === "MENUNGGU_KONFIRMASI" ? (
                              <>
                                <ConfirmBookingButton bookingId={b.id} />
                                <RejectBookingModal bookingId={b.id} bookingCode={b.bookingCode} />
                              </>
                            ) : (
                              <Link
                                href={`/admin/bookings/${b.id}`}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Detail</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

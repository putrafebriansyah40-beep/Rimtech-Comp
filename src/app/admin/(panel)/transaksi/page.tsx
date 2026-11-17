import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { formatRupiah, toNumber } from "@/lib/utils";
import { formatDateTimeWIB } from "@/lib/dates";
import { DollarSign, CreditCard, Wallet, ArrowUpRight } from "lucide-react";
import type { Prisma, PaymentType } from "@prisma/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminTransaksiPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const type = typeof searchParams.type === "string" ? searchParams.type : undefined;

  const filterType =
    type === "DP_QRIS" || type === "PELUNASAN_OFFLINE"
      ? (type as PaymentType)
      : undefined;

  const whereClause: Prisma.PaymentWhereInput = {
    paymentStatus: "SETTLEMENT",
    ...(filterType ? { paymentType: filterType } : {}),
  };

  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      booking: {
        include: { customer: true },
      },
    },
    orderBy: { transactionTime: "desc" },
  });

  // Calculate totals
  const allSettled = await prisma.payment.findMany({
    where: { paymentStatus: "SETTLEMENT" },
    select: { paymentType: true, amount: true },
  });

  let totalOmzet = 0;
  let totalDp = 0;
  let totalPelunasan = 0;

  for (const p of allSettled) {
    const val = toNumber(p.amount);
    totalOmzet += val;
    if (p.paymentType === "DP_QRIS") totalDp += val;
    if (p.paymentType === "PELUNASAN_OFFLINE") totalPelunasan += val;
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Rekapitulasi Keuangan & Transaksi (FR-13)" />

      <main className="p-6 sm:p-8 space-y-6">
        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Omzet Kas Masuk</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block font-mono">
                {formatRupiah(totalOmzet)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Akumulasi seluruh transaksi</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Uang Muka (DP)</span>
              <span className="text-2xl font-extrabold text-sky-600 mt-1 block font-mono">
                {formatRupiah(totalDp)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Gateway QRIS Otomatis</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Pelunasan Offline</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block font-mono">
                {formatRupiah(totalPelunasan)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Tunai & Transfer di Toko</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Transaksi Terverifikasi (Settled)</h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              <Link
                href="/admin/transaksi"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  !type || type === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Semua
              </Link>
              <Link
                href="/admin/transaksi?type=DP_QRIS"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  type === "DP_QRIS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Hanya DP QRIS
              </Link>
              <Link
                href="/admin/transaksi?type=PELUNASAN_OFFLINE"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  type === "PELUNASAN_OFFLINE" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Hanya Pelunasan Toko
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">No. Invoice</th>
                  <th className="py-3 px-4">Tipe Pembayaran</th>
                  <th className="py-3 px-4">Kode Booking & Pelanggan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Nominal Masuk</th>
                  <th className="py-3 px-4">Waktu Transaksi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Belum ada transaksi pembayaran yang tercatat.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            p.paymentType === "DP_QRIS"
                              ? "bg-sky-50 text-sky-800 border border-sky-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {p.paymentType === "DP_QRIS" ? "Uang Muka (DP)" : "Pelunasan Offline"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {p.booking.bookingCode}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.booking.customer.fullName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{p.paymentMethod}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                        {formatRupiah(toNumber(p.amount))}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {p.transactionTime ? formatDateTimeWIB(p.transactionTime) : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/bookings/${p.bookingId}`}
                          className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Lihat</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
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

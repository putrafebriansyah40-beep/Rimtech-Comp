import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getBookingByCode, dpPaidOf } from "@/lib/services/booking";
import { formatDateID, dateToTime } from "@/lib/dates";
import { formatRupiah, maskPhone, maskName, toNumber } from "@/lib/utils";
import { SERVICE_STATUS } from "@/lib/constants";
import { BookingBadge, ServiceBadge } from "@/components/ui/status-badge";
import { ServiceTimeline } from "@/components/service-timeline";
import {
  Laptop,
  ArrowLeft,
  AlertCircle,
  Receipt,
  QrCode,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return {
    title: `Lacak Servis ${code} - RimTech Comp`,
  };
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Jika input di URL berupa nomor telepon, alihkan otomatis ke pencarian nomor WhatsApp
  if (/^\+?[0-9\s-]+$/.test(code) && code.length >= 8 && !code.toUpperCase().startsWith("RMC-")) {
    redirect(`/lacak?q=${encodeURIComponent(code)}`);
  }

  const booking = await getBookingByCode(code);

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 py-16">
          <div className="max-w-xl mx-auto px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Booking Tidak Ditemukan</h1>
            <p className="text-xs text-slate-500">
              Tidak ditemukan data reservasi dengan kode <strong>{code}</strong>. Periksa kembali format kode
              booking Anda atau hubungi admin toko.
            </p>
            <div className="pt-2">
              <Link
                href="/lacak"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cari Kode Lain</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const latestLog = booking.serviceLogs[booking.serviceLogs.length - 1];
  const currentServiceStatus = latestLog?.status ?? "MENUNGGU_PENYERAHAN";
  const statusMeta = SERVICE_STATUS[currentServiceStatus];
  const dpAmount = dpPaidOf(booking.payments);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center justify-between">
            <Link
              href="/lacak"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Pencarian</span>
            </Link>
            <span className="text-xs text-slate-400">Kode Booking Resmi RimTech Comp</span>
          </div>

          {/* Main Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                      Status Reservasi
                    </span>
                    <BookingBadge status={booking.bookingStatus} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                    {booking.bookingCode}
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Jadwal Penyerahan Unit:{" "}
                    <strong>
                      {formatDateID(booking.dropOffDate)} pukul {dateToTime(booking.dropOffTime)} WIB
                    </strong>
                  </p>
                </div>

                {/* Tagihan / Biaya summary */}
                <div className="sm:text-right bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  {booking.remainingCost !== null && toNumber(booking.remainingCost) > 0 ? (
                    <div>
                      <span className="text-[11px] text-slate-300 block">Sisa Pelunasan di Toko:</span>
                      <span className="text-2xl font-mono font-extrabold text-amber-400">
                        {formatRupiah(toNumber(booking.remainingCost))}
                      </span>
                    </div>
                  ) : booking.finalCost !== null ? (
                    <div>
                      <span className="text-[11px] text-slate-300 block">Total Biaya (Lunas):</span>
                      <span className="text-2xl font-mono font-extrabold text-emerald-400">
                        {formatRupiah(toNumber(booking.finalCost))}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] text-slate-300 block">Uang Muka (DP):</span>
                      <span className="text-xl font-mono font-bold text-white">
                        {formatRupiah(dpAmount)} (Terbayar)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Payment Alert & Resume Button */}
            {booking.bookingStatus === "MENUNGGU_PEMBAYARAN" && (
              <div className="p-4 sm:p-5 bg-amber-50 border-b border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-sm text-amber-900 block">Uang Muka (DP) Belum Dibayar</strong>
                    <span className="text-amber-800">
                      Reservasi Anda sedang ditahan. Selesaikan pembayaran DP sebesar {formatRupiah(dpAmount)} via QRIS untuk mengamankan slot antrean.
                    </span>
                  </div>
                </div>
                <Link
                  href={`/booking/${booking.bookingCode}/bayar`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Buka QR Code Pembayaran</span>
                </Link>
              </div>
            )}

            {/* Rejection Alert if any */}
            {booking.bookingStatus === "DITOLAK" && (
              <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Booking Ditolak Teknisi</strong>
                  <span>Alasan: {booking.rejectionReason || "Kapasitas unit atau sparepart tidak tersedia."}</span>
                </div>
              </div>
            )}

            {/* Live Progress Status Box */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Progres Fisik Unit:</span>
                    <ServiceBadge status={currentServiceStatus} />
                  </div>
                  <p className="text-xs text-slate-700">{statusMeta?.description}</p>
                </div>
                {currentServiceStatus === "SELESAI" && (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shrink-0 text-center">
                    Laptop Siap Diambil
                  </span>
                )}
              </div>

              {/* Service Stepper & Audit Log */}
              <ServiceTimeline currentStatus={currentServiceStatus} logs={booking.serviceLogs} />
            </div>
          </div>

          {/* Grid Information Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
                <Laptop className="w-4 h-4 text-sky-600" />
                <span>Rincian Perangkat & Keluhan</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 block text-[11px]">Merek & Tipe Laptop:</span>
                  <strong className="text-slate-900 font-semibold text-sm">
                    {booking.laptopBrand} {booking.laptopModel}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deskripsi Keluhan:</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mt-1">
                    {booking.issueDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial & Customer Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
                <Receipt className="w-4 h-4 text-sky-600" />
                <span>Rincian Finansial & Pemilik</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Pemilik:</span>
                  <strong className="text-slate-900">{maskName(booking.customer.fullName)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nomor WhatsApp:</span>
                  <span className="font-mono text-slate-700">{maskPhone(booking.customer.whatsappNumber)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Uang Muka (DP QRIS):</span>
                  <strong className="text-emerald-700 font-mono">{formatRupiah(dpAmount)}</strong>
                </div>
                {booking.finalCost !== null && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total Biaya Perbaikan:</span>
                    <strong className="text-slate-900 font-mono">
                      {formatRupiah(toNumber(booking.finalCost))}
                    </strong>
                  </div>
                )}
                {booking.remainingCost !== null && (
                  <div className="flex justify-between py-1 bg-amber-50 p-2 rounded-lg text-amber-900">
                    <span className="font-semibold">Sisa Pelunasan di Toko:</span>
                    <strong className="font-mono font-bold">
                      {formatRupiah(toNumber(booking.remainingCost))}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

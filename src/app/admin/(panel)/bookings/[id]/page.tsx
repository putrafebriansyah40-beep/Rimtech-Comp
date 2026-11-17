import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { BookingBadge, ServiceBadge, PaymentBadge, WhatsappBadge } from "@/components/ui/status-badge";
import { ConfirmBookingButton, RejectBookingModal } from "@/components/admin/booking-actions";
import { ProgressUpdater } from "@/components/admin/progress-updater";
import { ServiceTimeline } from "@/components/service-timeline";
import { dpPaidOf } from "@/lib/services/booking";
import { formatDateID, dateToTime, formatDateTimeWIB } from "@/lib/dates";
import { formatRupiah, toNumber } from "@/lib/utils";
import {
  ArrowLeft,
  Laptop,
  User,
  Receipt,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      payments: { orderBy: { createdAt: "asc" } },
      serviceLogs: {
        include: { technician: true },
        orderBy: { createdAt: "asc" },
      },
      whatsappLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) notFound();

  const latestLog = booking.serviceLogs[booking.serviceLogs.length - 1];
  const currentServiceStatus = latestLog?.status ?? "MENUNGGU_PENYERAHAN";
  const dpPaid = dpPaidOf(booking.payments);
  const isFinished = booking.bookingStatus === "SELESAI" && currentServiceStatus === "DIAMBIL";

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title={`Detail Booking #${booking.bookingCode}`} />

      <main className="p-6 sm:p-8 space-y-6">
        {/* Back link & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Antrean</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/lacak/${booking.bookingCode}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Tampilan Pelanggan</span>
            </Link>

            {booking.bookingStatus === "MENUNGGU_KONFIRMASI" && (
              <>
                <ConfirmBookingButton bookingId={booking.id} />
                <RejectBookingModal bookingId={booking.id} bookingCode={booking.bookingCode} />
              </>
            )}
          </div>
        </div>

        {/* Header Info Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-mono font-extrabold text-slate-900">
                {booking.bookingCode}
              </span>
              <BookingBadge status={booking.bookingStatus} />
              <ServiceBadge status={currentServiceStatus} />
            </div>
            <p className="text-xs text-slate-500">
              Dibuat pada {formatDateTimeWIB(booking.createdAt)} • Jadwal pengantaran unit:{" "}
              <strong>
                {formatDateID(booking.dropOffDate)} ({dateToTime(booking.dropOffTime)} WIB)
              </strong>
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block">Sisa Pelunasan di Toko:</span>
            <span className="text-2xl font-mono font-extrabold text-amber-600">
              {formatRupiah(toNumber(booking.remainingCost))}
            </span>
          </div>
        </div>

        {/* Interactive Progress Updater (Teknisi Tool) */}
        {booking.bookingStatus === "DIKONFIRMASI" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <ProgressUpdater
              bookingId={booking.id}
              currentStatus={currentServiceStatus}
              dpPaid={dpPaid}
              finalCost={toNumber(booking.finalCost) || null}
              remainingCost={toNumber(booking.remainingCost) || null}
              isFinished={isFinished}
            />
          </div>
        )}

        {/* 2-Columns Info: Customer & Laptop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-sky-600" />
              <span>Informasi Pelanggan</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Lengkap:</span>
                <strong className="text-slate-900">{booking.customer.fullName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">WhatsApp:</span>
                <a
                  href={`https://wa.me/${booking.customer.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sky-600 hover:underline font-semibold"
                >
                  +{booking.customer.whatsappNumber}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700">{booking.customer.email || "-"}</span>
              </div>
            </div>
          </div>

          {/* Device Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
              <Laptop className="w-4 h-4 text-sky-600" />
              <span>Perangkat & Keluhan Kerusakan</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Merek & Model Laptop:</span>
                <strong className="text-slate-900 font-bold text-sm">
                  {booking.laptopBrand} {booking.laptopModel}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Keluhan:</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed mt-1">
                  {booking.issueDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Stepper & Audit Log */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Riwayat Status Pengerjaan (Audit Log)
          </h3>
          <ServiceTimeline currentStatus={currentServiceStatus} logs={booking.serviceLogs} />
        </div>

        {/* Financial & Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
            <Receipt className="w-4 h-4 text-sky-600" />
            <span>Riwayat Transaksi Pembayaran</span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-100">
                <th className="py-2">No. Invoice</th>
                <th className="py-2">Tipe</th>
                <th className="py-2">Metode</th>
                <th className="py-2">Nominal</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {booking.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 font-mono font-bold text-slate-900">{p.invoiceNumber}</td>
                  <td className="py-2.5">
                    {p.paymentType === "DP_QRIS" ? "Uang Muka (DP)" : "Pelunasan Toko"}
                  </td>
                  <td className="py-2.5">{p.paymentMethod}</td>
                  <td className="py-2.5 font-mono font-bold">{formatRupiah(toNumber(p.amount))}</td>
                  <td className="py-2.5">
                    <PaymentBadge status={p.paymentStatus} />
                  </td>
                  <td className="py-2.5 text-right text-slate-400 font-mono text-[11px]">
                    {p.transactionTime ? formatDateTimeWIB(p.transactionTime) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WhatsApp Notification Logs */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
            <MessageSquare className="w-4 h-4 text-sky-600" />
            <span>Log Notifikasi WhatsApp Gateway (FR-12)</span>
          </div>

          {booking.whatsappLogs.length === 0 ? (
            <p className="text-slate-400 text-xs py-2">Belum ada pesan WhatsApp yang dipicu.</p>
          ) : (
            <div className="space-y-2.5">
              {booking.whatsappLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{log.messageType}</span>
                    <WhatsappBadge status={log.status} />
                  </div>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans bg-white p-2.5 rounded-lg border border-slate-100">
                    {log.messageBody}
                  </pre>
                  <div className="text-[10px] text-slate-400">
                    Tujuan: +{log.recipientNumber} • Waktu:{" "}
                    {log.sentAt ? formatDateTimeWIB(log.sentAt) : formatDateTimeWIB(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

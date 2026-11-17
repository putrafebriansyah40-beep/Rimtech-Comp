import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getBookingByCode } from "@/lib/services/booking";
import { formatDateID, dateToTime } from "@/lib/dates";
import { formatRupiah, toNumber } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { BookingBadge } from "@/components/ui/status-badge";

export const metadata = {
  title: "Booking Berhasil - RimTech Comp",
};

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const booking = await getBookingByCode(code);
  if (!booking) notFound();

  const dp = booking.payments.find((p) => p.paymentType === "DP_QRIS");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Success Banner */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pembayaran DP Berhasil Diterima!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Terima kasih! Reservasi booking servis Anda telah tercatat di sistem kami dan sedang
              menunggu konfirmasi teknisi.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider block">
                    Kode Booking Anda
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight mt-1 text-white">
                    {booking.bookingCode}
                  </div>
                </div>
                <BookingBadge status={booking.bookingStatus} />
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-5 text-xs">
              {/* Jadwal Box */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tanggal Pengantaran:</span>
                    <strong className="text-slate-900 font-bold block text-sm">
                      {formatDateID(booking.dropOffDate)}
                    </strong>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">Jam Penyerahan Unit:</span>
                    <strong className="text-slate-900 font-bold block text-sm">
                      {dateToTime(booking.dropOffTime)} WIB
                    </strong>
                  </div>
                </div>
              </div>

              {/* Rincian Ringkas */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nama Pelanggan:</span>
                  <span className="font-semibold text-slate-900">{booking.customer.fullName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nomor WhatsApp:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    +{booking.customer.whatsappNumber}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Perangkat Laptop:</span>
                  <span className="font-semibold text-slate-900">
                    {booking.laptopBrand} {booking.laptopModel}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">DP Dibayar (QRIS):</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {formatRupiah(toNumber(dp?.amount))} (Lunas)
                  </span>
                </div>
              </div>

              {/* Petunjuk Pengantaran */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>Petunjuk Penyerahan Unit di Toko:</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Bawa laptop Anda beserta unit charger ke <strong>{STORE.name}</strong> ({STORE.address})
                  sesuai jam yang tertera di atas. Tunjukkan <strong>Kode Booking {booking.bookingCode}</strong>{" "}
                  ke teknisi kami saat penyerahan unit.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/lacak/${booking.bookingCode}`}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-center text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Lacak Status Pengerjaan Laptop</span>
                </Link>
                <a
                  href={`https://wa.me/${STORE.whatsapp}?text=Halo%20RimTech%20Comp,%20saya%20sudah%20booking%20dengan%20kode%20${booking.bookingCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-center text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hubungi Teknisi via WA</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingForm } from "@/components/booking-form";
import { config } from "@/lib/config";
import { CalendarCheck } from "lucide-react";

export const metadata = {
  title: "Formulir Booking Servis Laptop - RimTech Comp",
  description: "Pilih tanggal buka toko, jam pengantaran, dan bayar DP via QRIS dinamis otomatis.",
};

export default function BookingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Reservasi Servis Resmi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Formulir Reservasi Servis Laptop
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Silakan lengkapi formulir di bawah untuk memilih jadwal penyerahan unit. Kuota harian
              dibatasi maksimal agar unit Anda lekas selesai diperbaiki.
            </p>
          </div>

          <BookingForm dpAmount={config.dpAmount} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

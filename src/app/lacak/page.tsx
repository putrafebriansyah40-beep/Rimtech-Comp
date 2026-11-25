import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TrackingSearch } from "@/components/tracking-search";
import { findBookingsByPhone } from "@/lib/services/booking";
import { formatDateID } from "@/lib/dates";
import { BookingBadge } from "@/components/ui/status-badge";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { maskPhone, normalizePhone } from "@/lib/utils";

export const metadata = {
  title: "Lacak Status Servis Laptop - RimTech Comp",
  description: "Pantau perkembangan perbaikan laptop secara mandiri berbekal Kode Booking atau nomor WhatsApp.",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TrackingRootPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const qParam = typeof searchParams.q === "string" ? searchParams.q : "";
  const query = qParam.trim();

  // Jika query format kode booking RMC-..., redirect langsung ke halaman detail
  if (query.toUpperCase().startsWith("RMC-")) {
    redirect(`/lacak/${query.toUpperCase()}`);
  }

  // Jika berupa nomor telepon
  let phoneBookings: Awaited<ReturnType<typeof findBookingsByPhone>> = [];
  if (query.length >= 8 && /^\+?[0-9\s-]+$/.test(query)) {
    phoneBookings = await findBookingsByPhone(query);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pelacakan Status Servis Laptop
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Ketahui sejauh mana laptop Anda ditangani teknisi, mulai dari penerimaan unit, diagnosa,
              perbaikan, hingga unit siap diambil.
            </p>
          </div>

          <TrackingSearch initialQuery={query} />

          {/* Hasil Pencarian Berdasarkan Nomor Telepon */}
          {query && phoneBookings.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Ditemukan {phoneBookings.length} Riwayat Servis untuk WhatsApp {maskPhone(normalizePhone(query))}:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phoneBookings.map((b) => {
                  const isPending = b.bookingStatus === "MENUNGGU_PEMBAYARAN";
                  return (
                    <Link
                      key={b.id}
                      href={isPending ? `/booking/${b.bookingCode}/bayar` : `/lacak/${b.bookingCode}`}
                      className={`p-5 rounded-2xl bg-white border ${
                        isPending ? "border-amber-300 hover:border-amber-400" : "border-slate-200 hover:border-sky-300"
                      } hover:shadow-md transition-all space-y-3 block`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-sky-700">{b.bookingCode}</span>
                        <BookingBadge status={b.bookingStatus} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {b.laptopBrand} {b.laptopModel}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.issueDescription}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500">
                          Jadwal: {formatDateID(b.dropOffDate, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {isPending ? (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            Lanjutkan Bayar DP <ArrowRight className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-sky-600 font-semibold flex items-center gap-1">
                            Lihat Progres <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {query && phoneBookings.length === 0 && !query.startsWith("RMC-") && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-xs text-slate-500">
                Tidak ditemukan data booking untuk pencarian &quot;{query}&quot;. Pastikan nomor WhatsApp atau
                format Kode Booking sudah benar (contoh: RMC-20261021-001).
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

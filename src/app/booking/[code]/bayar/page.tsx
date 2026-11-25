import React from "react";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PaymentView } from "@/components/payment-view";
import { getBookingByCode } from "@/lib/services/booking";
import { qrDataUrl } from "@/lib/services/payment";
import { config } from "@/lib/config";
import { toNumber } from "@/lib/utils";

export const metadata = {
  title: "Pembayaran DP QRIS - RimTech Comp",
};

export default async function BookingPaymentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const booking = await getBookingByCode(code);

  if (!booking) notFound();

  // Jika sudah terbayar, langsung arahkan ke sukses
  const dpPayment = booking.payments.find((p) => p.paymentType === "DP_QRIS");
  if (dpPayment?.paymentStatus === "SETTLEMENT" || booking.bookingStatus !== "MENUNGGU_PEMBAYARAN") {
    redirect(`/booking/${code}/sukses`);
  }

  // Siapkan QR Code data URL
  let qrImage: string | null = null;
  if (dpPayment?.qrisString) {
    try {
      qrImage = await qrDataUrl(dpPayment.qrisString);
    } catch {
      qrImage = null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PaymentView
            bookingCode={booking.bookingCode}
            invoiceNumber={dpPayment?.invoiceNumber ?? "-"}
            amount={toNumber(dpPayment?.amount)}
            qrDataUrlString={qrImage}
            qrisString={dpPayment?.qrisString ?? null}
            expiresAt={dpPayment?.expiresAt ? dpPayment.expiresAt.toISOString() : null}
            isSimulation={!config.midtrans.isProduction}
            laptopName={`${booking.laptopBrand} ${booking.laptopModel}`}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

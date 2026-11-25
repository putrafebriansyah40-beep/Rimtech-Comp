import { NextResponse } from "next/server";
import { getBookingByCode, markPaymentClosed, markPaymentSettled } from "@/lib/services/booking";
import { getMidtransTransactionStatus, mapMidtransStatus } from "@/lib/services/payment";

export const dynamic = "force-dynamic";

/** GET /api/booking/:code/status - polling status pembayaran di halaman QRIS */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const booking = await getBookingByCode(code);
  if (!booking) return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });

  const dp = booking.payments.find((p) => p.paymentType === "DP_QRIS");

  // Jika pembayaran masih PENDING, sinkronkan status langsung ke API Midtrans
  // agar pembayaran via Simulator Midtrans langsung terdeteksi di localhost tanpa butuh webhook publik
  if (dp && dp.paymentStatus === "PENDING" && dp.gatewayOrderId) {
    const midtransStatus = await getMidtransTransactionStatus(dp.gatewayOrderId);
    if (midtransStatus) {
      const mapped = mapMidtransStatus(midtransStatus);
      if (mapped === "SETTLEMENT") {
        const time = midtransStatus.settlement_time ?? midtransStatus.transaction_time;
        await markPaymentSettled(
          dp.gatewayOrderId,
          time ? new Date(`${time.replace(" ", "T")}+07:00`) : undefined
        );
        return NextResponse.json({
          bookingCode: booking.bookingCode,
          bookingStatus: "MENUNGGU_KONFIRMASI",
          paymentStatus: "SETTLEMENT",
          expiresAt: dp.expiresAt,
        });
      } else if (mapped === "EXPIRED" || mapped === "FAILED") {
        await markPaymentClosed(dp.gatewayOrderId, mapped);
      }
    }
  }

  return NextResponse.json({
    bookingCode: booking.bookingCode,
    bookingStatus: booking.bookingStatus,
    paymentStatus: dp?.paymentStatus ?? null,
    expiresAt: dp?.expiresAt ?? null,
  });
}

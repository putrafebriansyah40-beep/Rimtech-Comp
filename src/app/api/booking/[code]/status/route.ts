import { NextResponse } from "next/server";
import { getBookingByCode } from "@/lib/services/booking";

export const dynamic = "force-dynamic";

/** GET /api/booking/:code/status - polling status pembayaran di halaman QRIS */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const booking = await getBookingByCode(code);
  if (!booking) return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });

  const dp = booking.payments.find((p) => p.paymentType === "DP_QRIS");
  return NextResponse.json({
    bookingCode: booking.bookingCode,
    bookingStatus: booking.bookingStatus,
    paymentStatus: dp?.paymentStatus ?? null,
    expiresAt: dp?.expiresAt ?? null,
  });
}

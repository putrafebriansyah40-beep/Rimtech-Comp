import { NextResponse } from "next/server";
import { z } from "zod";
import { isPaymentSimulation } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { markPaymentSettled } from "@/lib/services/booking";

/**
 * POST /api/payment/simulate - HANYA aktif pada mode simulasi (tanpa Midtrans key).
 * Mensimulasikan callback "settlement" dari Payment Gateway untuk keperluan demo.
 */
export async function POST(req: Request) {
  if (!isPaymentSimulation()) {
    return NextResponse.json({ error: "Mode simulasi tidak aktif" }, { status: 403 });
  }
  const parsed = z.object({ bookingCode: z.string().min(5) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const payment = await prisma.payment.findFirst({
    where: {
      paymentType: "DP_QRIS",
      paymentStatus: "PENDING",
      booking: { bookingCode: parsed.data.bookingCode },
    },
  });
  if (!payment?.gatewayOrderId) {
    return NextResponse.json({ error: "Tagihan tidak ditemukan / sudah diproses" }, { status: 404 });
  }

  await markPaymentSettled(payment.gatewayOrderId);
  return NextResponse.json({ ok: true });
}

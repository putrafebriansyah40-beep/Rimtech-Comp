import { NextResponse } from "next/server";
import {
  mapMidtransStatus,
  verifySignature,
  type MidtransNotification,
} from "@/lib/services/payment";
import { markPaymentClosed, markPaymentSettled } from "@/lib/services/booking";

/**
 * POST /api/payment/webhook - Notifikasi HTTP(S) dari Midtrans (FR-04)
 * Set URL ini di Dashboard Midtrans: Settings -> Configuration -> Payment Notification URL
 */
export async function POST(req: Request) {
  let n: MidtransNotification;
  try {
    n = (await req.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ message: "invalid payload" }, { status: 400 });
  }

  if (!n?.order_id || !verifySignature(n)) {
    return NextResponse.json({ message: "invalid signature" }, { status: 403 });
  }

  const status = mapMidtransStatus(n);
  try {
    if (status === "SETTLEMENT") {
      const time = n.settlement_time ?? n.transaction_time;
      await markPaymentSettled(
        n.order_id,
        time ? new Date(`${time.replace(" ", "T")}+07:00`) : undefined,
      );
    } else if (status === "EXPIRED" || status === "FAILED") {
      await markPaymentClosed(n.order_id, status);
    }
  } catch (err) {
    console.error("[WEBHOOK] gagal memproses notifikasi", err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }

  return NextResponse.json({ message: "ok" });
}

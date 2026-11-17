import "server-only";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { config, isPaymentSimulation } from "@/lib/config";

// Integrasi Payment Gateway Midtrans (Core API - QRIS).
// Jika MIDTRANS_SERVER_KEY kosong, sistem berjalan dalam MODE SIMULASI:
// QR code dibuat lokal & pembayaran dapat disimulasikan dari halaman pembayaran.

const baseUrl = () =>
  config.midtrans.isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";

const authHeader = () =>
  "Basic " + Buffer.from(`${config.midtrans.serverKey}:`).toString("base64");

export type QrisCharge = {
  gatewayOrderId: string;
  qrisString: string | null;
  qrisUrl: string | null;
  expiresAt: Date;
};

/** Payment.generateQRISCharge() */
export async function createQrisCharge(params: {
  orderId: string;
  amount: number;
  customer: { name: string; phone: string; email?: string | null };
  itemName: string;
}): Promise<QrisCharge> {
  const expiresAt = new Date(Date.now() + config.paymentExpiryMinutes * 60_000);

  if (isPaymentSimulation()) {
    return {
      gatewayOrderId: params.orderId,
      qrisString: `SIMULASI-QRIS|${params.orderId}|${params.amount}`,
      qrisUrl: null,
      expiresAt,
    };
  }

  const res = await fetch(`${baseUrl()}/v2/charge`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: { order_id: params.orderId, gross_amount: params.amount },
      item_details: [
        { id: "DP", price: params.amount, quantity: 1, name: params.itemName.slice(0, 50) },
      ],
      customer_details: {
        first_name: params.customer.name,
        phone: params.customer.phone,
        email: params.customer.email ?? undefined,
      },
      qris: { acquirer: "gopay" },
      custom_expiry: { expiry_duration: config.paymentExpiryMinutes, unit: "minute" },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json()) as {
    status_code?: string;
    status_message?: string;
    qr_string?: string;
    actions?: { name: string; url: string }[];
    expiry_time?: string;
  };

  if (!json.status_code?.startsWith("2")) {
    throw new Error(`Midtrans: ${json.status_message ?? "gagal membuat transaksi QRIS"}`);
  }

  const qrAction = json.actions?.find((a) => a.name === "generate-qr-code");
  return {
    gatewayOrderId: params.orderId,
    qrisString: json.qr_string ?? null,
    qrisUrl: qrAction?.url ?? null,
    expiresAt: json.expiry_time ? new Date(`${json.expiry_time.replace(" ", "T")}+07:00`) : expiresAt,
  };
}

/** Membuat data URL gambar QR dari string QRIS (dipakai untuk tampilan) */
export async function qrDataUrl(qrisString: string) {
  return QRCode.toDataURL(qrisString, {
    margin: 1,
    width: 320,
    color: { dark: "#0b1020", light: "#ffffff" },
  });
}

export type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_time?: string;
  settlement_time?: string;
  fraud_status?: string;
  payment_type?: string;
};

/** Payment.verifyWebhookNotification() - validasi signature SHA512 Midtrans */
export function verifySignature(n: MidtransNotification): boolean {
  if (!config.midtrans.serverKey) return false;
  const expected = crypto
    .createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + config.midtrans.serverKey)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(n.signature_key ?? "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Memetakan transaction_status Midtrans ke PaymentStatus internal */
export function mapMidtransStatus(n: MidtransNotification) {
  switch (n.transaction_status) {
    case "settlement":
      return "SETTLEMENT" as const;
    case "capture":
      return n.fraud_status === "accept" ? ("SETTLEMENT" as const) : ("PENDING" as const);
    case "expire":
      return "EXPIRED" as const;
    case "cancel":
    case "deny":
    case "failure":
      return "FAILED" as const;
    default:
      return "PENDING" as const;
  }
}

import "server-only";
import { prisma } from "@/lib/prisma";
import { config, isWhatsappSimulation } from "@/lib/config";
import { STORE } from "@/lib/constants";
import { dateToTime, formatDateID } from "@/lib/dates";
import { formatRupiah } from "@/lib/utils";

export type WhatsappMessageType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_REJECTED"
  | "SERVICE_COMPLETED"
  | "PAYMENT_RECEIVED";

type BookingForMessage = {
  id: number;
  bookingCode: string;
  laptopBrand: string;
  laptopModel: string;
  dropOffDate: Date;
  dropOffTime: Date;
  finalCost?: unknown;
  remainingCost?: unknown;
  rejectionReason?: string | null;
  customer: { fullName: string; whatsappNumber: string };
};

/** Template pesan WhatsApp (WhatsAppNotification.formatMessage) */
export function formatMessage(type: WhatsappMessageType, b: BookingForMessage): string {
  const trackUrl = `${config.appUrl}/lacak/${b.bookingCode}`;
  const jadwal = `${formatDateID(b.dropOffDate)} pukul ${dateToTime(b.dropOffTime)} WIB`;
  const laptop = `${b.laptopBrand} ${b.laptopModel}`;

  switch (type) {
    case "PAYMENT_RECEIVED":
      return [
        `Halo *${b.customer.fullName}* 👋`,
        ``,
        `Pembayaran DP untuk booking *${b.bookingCode}* telah kami terima ✅`,
        `Booking Anda sedang ditinjau oleh teknisi ${STORE.name}. Kami akan mengirim konfirmasi jadwal segera.`,
        ``,
        `Pantau status: ${trackUrl}`,
      ].join("\n");
    case "BOOKING_CONFIRMED":
      return [
        `Halo *${b.customer.fullName}* 👋`,
        ``,
        `Booking servis laptop Anda telah *DIKONFIRMASI* ✅`,
        ``,
        `🔖 Kode Booking: *${b.bookingCode}*`,
        `💻 Laptop: ${laptop}`,
        `📅 Jadwal antar unit: ${jadwal}`,
        `📍 Lokasi: ${STORE.address}`,
        ``,
        `Silakan datang sesuai jadwal dan tunjukkan Kode Booking kepada teknisi.`,
        `Lacak progres servis: ${trackUrl}`,
        ``,
        `Terima kasih telah mempercayakan laptop Anda kepada *${STORE.name}* 🙏`,
      ].join("\n");
    case "BOOKING_REJECTED":
      return [
        `Halo *${b.customer.fullName}*,`,
        ``,
        `Mohon maaf, booking *${b.bookingCode}* (${laptop}) *tidak dapat kami proses*.`,
        `Alasan: ${b.rejectionReason ?? "-"}`,
        ``,
        `Untuk pengembalian DP, silakan balas pesan ini atau hubungi kami di wa.me/${STORE.whatsapp}.`,
        `Terima kasih atas pengertiannya 🙏`,
      ].join("\n");
    case "SERVICE_COMPLETED":
      return [
        `Halo *${b.customer.fullName}* 👋`,
        ``,
        `Kabar baik! Laptop *${laptop}* Anda telah *SELESAI DIPERBAIKI* 🎉`,
        ``,
        `🔖 Kode Booking: *${b.bookingCode}*`,
        `💰 Total biaya: ${formatRupiah(b.finalCost as number)}`,
        `💳 Sisa pelunasan: *${formatRupiah(b.remainingCost as number)}*`,
        ``,
        `Silakan ambil unit di ${STORE.name} (${STORE.hours}). Pelunasan dapat dilakukan tunai/transfer di toko.`,
        `Detail: ${trackUrl}`,
      ].join("\n");
  }
}

/**
 * Mengirim pesan via Fonnte (WhatsAppNotification.sendViaGatewayAPI).
 * Kegagalan TIDAK melempar error agar tidak membatalkan transaksi utama
 * (NFR 4.3 - Fault Tolerance). Setiap percobaan dicatat di whatsapp_logs.
 */
export async function sendWhatsapp(type: WhatsappMessageType, booking: BookingForMessage) {
  const message = formatMessage(type, booking);
  const target = booking.customer.whatsappNumber;

  const log = await prisma.whatsappLog.create({
    data: {
      bookingId: booking.id,
      recipientNumber: target,
      messageType: type,
      messageBody: message,
      status: "PENDING",
    },
  });

  let ok = false;
  try {
    if (isWhatsappSimulation()) {
      console.info(`[WA SIMULASI] -> ${target} (${type})\n${message}\n`);
      ok = true;
    } else {
      const body = new URLSearchParams({ target, message, countryCode: "62" });
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { Authorization: config.fonnteToken },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      const json = (await res.json().catch(() => ({}))) as { status?: boolean; reason?: string };
      ok = res.ok && json.status === true;
      if (!ok) console.error("[WA] Fonnte gagal:", json.reason ?? res.statusText);
    }
  } catch (err) {
    console.error("[WA] Error mengirim pesan:", err);
    ok = false;
  }

  await prisma.whatsappLog.update({
    where: { id: log.id },
    data: { status: ok ? "SUCCESS" : "FAILED", sentAt: ok ? new Date() : null },
  });
  return ok;
}

/** Kirim ulang log WhatsApp yang gagal */
export async function resendWhatsappLog(logId: number) {
  const log = await prisma.whatsappLog.findUnique({ where: { id: logId } });
  if (!log) return false;
  const booking = await prisma.booking.findUnique({
    where: { id: log.bookingId },
    include: { customer: true },
  });
  if (!booking) return false;
  return sendWhatsapp(log.messageType as WhatsappMessageType, booking);
}

import "server-only";
import { Prisma, type ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { compactTodayWIB, isoToDate, nowTimeWIB, timeToDate, todayISO, addDaysISO } from "@/lib/dates";
import { normalizePhone, toNumber } from "@/lib/utils";
import type { bookingSchema } from "@/lib/validations";
import type { z } from "zod";
import { createQrisCharge } from "./payment";
import { releaseSlot, reserveSlot, SlotError } from "./slot";
import { sendWhatsapp } from "./whatsapp";

type BookingData = z.output<typeof bookingSchema>;

export class BookingError extends Error {}

// ---------------------------------------------------------------------
// Generator kode unik: RMC-YYYYMMDD-001 & INV-YYYYMMDD-001
// ---------------------------------------------------------------------
async function nextSequence(
  tx: Prisma.TransactionClient,
  kind: "booking" | "invoice",
  prefix: string,
): Promise<string> {
  const latest =
    kind === "booking"
      ? await tx.booking.findFirst({
          where: { bookingCode: { startsWith: prefix } },
          orderBy: { bookingCode: "desc" },
          select: { bookingCode: true },
        })
      : await tx.payment.findFirst({
          where: { invoiceNumber: { startsWith: prefix } },
          orderBy: { invoiceNumber: "desc" },
          select: { invoiceNumber: true },
        });
  const last = latest
    ? Number(("bookingCode" in latest ? latest.bookingCode : latest.invoiceNumber).split("-").pop())
    : 0;
  return `${prefix}${String(last + 1).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------
// FR-01, FR-02, FR-03: Membuat booking + tagihan DP QRIS
// ---------------------------------------------------------------------
export async function createBooking(data: BookingData) {
  const today = todayISO();
  const maxDate = addDaysISO(today, config.bookingWindowDays);

  if (data.dropOffDate < today) throw new BookingError("Tanggal pengantaran tidak boleh di masa lalu.");
  if (data.dropOffDate > maxDate)
    throw new BookingError(`Booking hanya dapat dilakukan maksimal ${config.bookingWindowDays} hari ke depan.`);
  if (data.dropOffDate === today && data.dropOffTime <= nowTimeWIB())
    throw new BookingError("Jam pengantaran hari ini sudah lewat. Pilih jam lain.");

  const phone = normalizePhone(data.whatsappNumber);
  const dateKey = compactTodayWIB();

  // Bersihkan booking kedaluwarsa terlebih dahulu agar slot ter-update
  await expireStaleBookings();

  let created: { bookingId: number; bookingCode: string; invoiceNumber: string } | null = null;

  // Retry bila terjadi tabrakan kode unik akibat request bersamaan
  for (let attempt = 0; attempt < 4 && !created; attempt++) {
    try {
      created = await prisma.$transaction(async (tx) => {
        const existing = await tx.customer.findFirst({
          where: { whatsappNumber: phone },
          orderBy: { id: "desc" },
        });

        // Anti Slot-Hoarding / DoS: Tolak jika nomor WhatsApp masih memiliki booking yang belum dibayar
        if (existing) {
          const activeUnpaid = await tx.booking.findFirst({
            where: {
              customerId: existing.id,
              bookingStatus: "MENUNGGU_PEMBAYARAN",
            },
          });
          if (activeUnpaid) {
            throw new BookingError(
              "Nomor WhatsApp Anda masih memiliki reservasi yang belum dibayar. Harap selesaikan pembayaran DP terlebih dahulu atau tunggu hingga 15 menit agar kedaluwarsa."
            );
          }
        }

        const customer = existing
          ? await tx.customer.update({
              where: { id: existing.id },
              data: { fullName: data.fullName, email: data.email ?? existing.email },
            })
          : await tx.customer.create({
              data: { fullName: data.fullName, whatsappNumber: phone, email: data.email },
            });

        const slotId = await reserveSlot(tx, data.dropOffDate);
        const bookingCode = await nextSequence(tx, "booking", `RMC-${dateKey}-`);
        const invoiceNumber = await nextSequence(tx, "invoice", `INV-${dateKey}-`);

        const booking = await tx.booking.create({
          data: {
            bookingCode,
            customerId: customer.id,
            slotId,
            laptopBrand: data.laptopBrand,
            laptopModel: data.laptopModel,
            issueDescription: data.issueDescription,
            dropOffDate: isoToDate(data.dropOffDate),
            dropOffTime: timeToDate(data.dropOffTime),
            bookingStatus: "MENUNGGU_PEMBAYARAN",
          },
        });

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            invoiceNumber,
            paymentType: "DP_QRIS",
            amount: config.dpAmount,
            paymentMethod: "QRIS",
            paymentStatus: "PENDING",
            gatewayOrderId: invoiceNumber,
          },
        });

        return { bookingId: booking.id, bookingCode, invoiceNumber };
      });
    } catch (err) {
      if (err instanceof SlotError) throw new BookingError(err.message);
      const isUniqueClash =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isUniqueClash || attempt === 3) throw err;
    }
  }
  if (!created) throw new BookingError("Gagal membuat booking. Silakan coba lagi.");

  // Request QRIS ke Payment Gateway (di luar transaksi DB)
  try {
    const charge = await createQrisCharge({
      orderId: created.invoiceNumber,
      amount: config.dpAmount,
      customer: { name: data.fullName, phone, email: data.email },
      itemName: `DP Servis ${created.bookingCode}`,
    });
    await prisma.payment.update({
      where: { invoiceNumber: created.invoiceNumber },
      data: {
        gatewayOrderId: charge.gatewayOrderId,
        qrisString: charge.qrisString,
        qrisUrl: charge.qrisUrl,
        expiresAt: charge.expiresAt,
      },
    });
  } catch (err) {
    console.error("[PAYMENT] Gagal membuat QRIS:", err);
    await markPaymentClosed(created.invoiceNumber, "FAILED");
    throw new BookingError("Gagal membuat tagihan QRIS. Silakan coba beberapa saat lagi.");
  }

  return created;
}

// ---------------------------------------------------------------------
// FR-04: Pembayaran terverifikasi (webhook / simulasi)
// ---------------------------------------------------------------------
export async function markPaymentSettled(orderId: string, transactionTime?: Date) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { gatewayOrderId: orderId },
      include: { booking: true },
    });
    if (!payment) return null;
    if (payment.paymentStatus === "SETTLEMENT") return { changed: false, bookingId: payment.bookingId };

    await tx.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: "SETTLEMENT", transactionTime: transactionTime ?? new Date() },
    });

    const b = payment.booking;
    if (b.bookingStatus === "DIBATALKAN") {
      // Pembayaran terlambat setelah booking kedaluwarsa: coba ambil kuota kembali
      try {
        await reserveSlot(tx, b.dropOffDate.toISOString().slice(0, 10));
      } catch {
        /* kuota penuh -> admin dapat menolak & mengembalikan DP */
      }
    }
    if (b.bookingStatus === "MENUNGGU_PEMBAYARAN" || b.bookingStatus === "DIBATALKAN") {
      await tx.booking.update({
        where: { id: b.id },
        data: { bookingStatus: "MENUNGGU_KONFIRMASI" },
      });
    }
    return { changed: true, bookingId: b.id };
  });

  if (result?.changed) {
    const booking = await prisma.booking.findUnique({
      where: { id: result.bookingId },
      include: { customer: true },
    });
    if (booking) await sendWhatsapp("PAYMENT_RECEIVED", booking);
  }
  return result;
}

/** Pembayaran kedaluwarsa / gagal: batalkan booking & kembalikan kuota */
export async function markPaymentClosed(orderId: string, status: "EXPIRED" | "FAILED") {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { gatewayOrderId: orderId },
      include: { booking: true },
    });
    if (!payment || payment.paymentStatus !== "PENDING") return false;

    await tx.payment.update({ where: { id: payment.id }, data: { paymentStatus: status } });
    if (payment.booking.bookingStatus === "MENUNGGU_PEMBAYARAN") {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { bookingStatus: "DIBATALKAN" },
      });
      await releaseSlot(tx, payment.booking.slotId);
    }
    return true;
  });
}

/** Membatalkan otomatis booking yang melewati batas waktu pembayaran DP */
export async function expireStaleBookings() {
  const stale = await prisma.payment.findMany({
    where: {
      paymentType: "DP_QRIS",
      paymentStatus: "PENDING",
      expiresAt: { lt: new Date(Date.now() - 60_000) }, // toleransi 1 menit
      booking: { bookingStatus: "MENUNGGU_PEMBAYARAN" },
    },
    select: { gatewayOrderId: true },
    take: 50,
  });
  for (const p of stale) {
    if (p.gatewayOrderId) await markPaymentClosed(p.gatewayOrderId, "EXPIRED");
  }
  return stale.length;
}

// ---------------------------------------------------------------------
// Query publik: status & tracking (FR-05, FR-06)
// ---------------------------------------------------------------------
export async function getBookingByCode(code: string) {
  await expireStaleBookings();
  return prisma.booking.findUnique({
    where: { bookingCode: code.trim().toUpperCase() },
    include: {
      customer: true,
      payments: { orderBy: { createdAt: "asc" } },
      serviceLogs: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function findBookingsByPhone(rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  return prisma.booking.findMany({
    where: { customer: { whatsappNumber: phone } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { serviceLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export function dpPaidOf(payments: { paymentType: string; paymentStatus: string; amount: unknown }[]) {
  return payments
    .filter((p) => p.paymentType === "DP_QRIS" && p.paymentStatus === "SETTLEMENT")
    .reduce((sum, p) => sum + toNumber(p.amount as number), 0);
}

// ---------------------------------------------------------------------
// Aksi Admin (FR-09, FR-11)
// ---------------------------------------------------------------------
async function loadForMessage(id: number) {
  return prisma.booking.findUniqueOrThrow({ where: { id }, include: { customer: true } });
}

export async function confirmBooking(id: number, technicianId: number) {
  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({ where: { id } });
    if (!b) throw new BookingError("Booking tidak ditemukan.");
    if (b.bookingStatus !== "MENUNGGU_KONFIRMASI")
      throw new BookingError("Hanya booking berstatus Menunggu Konfirmasi yang dapat dikonfirmasi.");
    await tx.booking.update({ where: { id }, data: { bookingStatus: "DIKONFIRMASI" } });
    await tx.serviceStatusLog.create({
      data: {
        bookingId: id,
        technicianId,
        status: "MENUNGGU_PENYERAHAN",
        notes: "Booking dikonfirmasi. Menunggu pelanggan mengantar unit laptop.",
      },
    });
  });
  await sendWhatsapp("BOOKING_CONFIRMED", await loadForMessage(id));
}

export async function rejectBooking(id: number, reason: string) {
  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({ where: { id } });
    if (!b) throw new BookingError("Booking tidak ditemukan.");
    if (b.bookingStatus !== "MENUNGGU_KONFIRMASI")
      throw new BookingError("Hanya booking berstatus Menunggu Konfirmasi yang dapat ditolak.");
    await tx.booking.update({
      where: { id },
      data: { bookingStatus: "DITOLAK", rejectionReason: reason },
    });
    await releaseSlot(tx, b.slotId);
  });
  await sendWhatsapp("BOOKING_REJECTED", await loadForMessage(id));
}

export async function cancelBooking(id: number, reason: string) {
  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({ where: { id }, include: { serviceLogs: true } });
    if (!b) throw new BookingError("Booking tidak ditemukan.");
    const unitReceived = b.serviceLogs.some((l) => l.status !== "MENUNGGU_PENYERAHAN");
    if (b.bookingStatus !== "DIKONFIRMASI" || unitReceived)
      throw new BookingError("Booking hanya dapat dibatalkan sebelum unit diterima.");
    await tx.booking.update({
      where: { id },
      data: { bookingStatus: "DIBATALKAN", rejectionReason: reason },
    });
    await releaseSlot(tx, b.slotId);
  });
}

export async function updateServiceProgress(params: {
  bookingId: number;
  technicianId: number;
  status: Exclude<ServiceStatus, "MENUNGGU_PENYERAHAN" | "DIAMBIL">;
  notes?: string;
  finalCost?: number;
}) {
  const { bookingId, technicianId, status, notes, finalCost } = params;
  let completed = false;

  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, serviceLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!b) throw new BookingError("Booking tidak ditemukan.");
    if (b.bookingStatus !== "DIKONFIRMASI")
      throw new BookingError("Progres hanya dapat diperbarui untuk booking yang sudah dikonfirmasi.");
    if (b.serviceLogs[0]?.status === "SELESAI" && status !== "SELESAI")
      throw new BookingError("Servis sudah selesai. Lanjutkan dengan mencatat pelunasan.");

    if (status === "SELESAI") {
      const total = finalCost ?? 0;
      const remaining = Math.max(total - dpPaidOf(b.payments), 0);
      await tx.booking.update({
        where: { id: bookingId },
        data: { finalCost: total, remainingCost: remaining },
      });
      completed = true;
    }

    await tx.serviceStatusLog.create({
      data: { bookingId, technicianId, status, notes: notes || null },
    });
  });

  if (completed) await sendWhatsapp("SERVICE_COMPLETED", await loadForMessage(bookingId));
}

/** Payment.recordOfflineSettlement() - pelunasan & serah terima unit */
export async function recordOfflineSettlement(params: {
  bookingId: number;
  technicianId: number;
  method: "CASH" | "TRANSFER";
}) {
  const { bookingId, technicianId, method } = params;
  const dateKey = compactTodayWIB();

  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { serviceLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!b) throw new BookingError("Booking tidak ditemukan.");
    if (b.bookingStatus !== "DIKONFIRMASI" || b.serviceLogs[0]?.status !== "SELESAI")
      throw new BookingError("Pelunasan hanya dapat dicatat setelah servis berstatus Selesai.");

    const remaining = toNumber(b.remainingCost);
    if (remaining > 0) {
      await tx.payment.create({
        data: {
          bookingId,
          invoiceNumber: await nextSequence(tx, "invoice", `INV-${dateKey}-`),
          paymentType: "PELUNASAN_OFFLINE",
          amount: remaining,
          paymentMethod: method,
          paymentStatus: "SETTLEMENT",
          transactionTime: new Date(),
        },
      });
    }
    await tx.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: "SELESAI", remainingCost: 0 },
    });
    await tx.serviceStatusLog.create({
      data: {
        bookingId,
        technicianId,
        status: "DIAMBIL",
        notes: `Pelunasan ${remaining > 0 ? `via ${method}` : "tidak diperlukan"}. Unit diserahkan ke pelanggan.`,
      },
    });
  });
}

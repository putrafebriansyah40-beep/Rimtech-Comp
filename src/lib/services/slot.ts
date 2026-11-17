import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import {
  addDaysISO,
  dateToISO,
  isoToDate,
  todayISO,
  weekdayOf,
} from "@/lib/dates";
import { expireStaleBookings } from "./booking";

export type SlotAvailability = {
  date: string; // YYYY-MM-DD
  maxCapacity: number;
  booked: number;
  remaining: number;
  isOpen: boolean;
  notes: string | null;
  configured: boolean; // true jika sudah ada baris di daily_slots
};

/** Nilai default ketika tanggal belum memiliki baris di tabel daily_slots */
export function defaultSlotFor(iso: string) {
  return {
    maxCapacity: config.defaultDailyCapacity,
    isStoreOpen: !config.closedWeekdays.includes(weekdayOf(iso)),
  };
}

/**
 * Mengambil ketersediaan slot untuk rentang tanggal (inklusif).
 * Tanggal yang belum dikonfigurasi admin memakai nilai default.
 */
export async function getAvailability(fromISO: string, toISO: string): Promise<SlotAvailability[]> {
  await expireStaleBookings();

  const rows = await prisma.dailySlot.findMany({
    where: { slotDate: { gte: isoToDate(fromISO), lte: isoToDate(toISO) } },
  });
  const map = new Map(rows.map((r) => [dateToISO(r.slotDate), r]));

  const result: SlotAvailability[] = [];
  for (let iso = fromISO; iso <= toISO; iso = addDaysISO(iso, 1)) {
    const row = map.get(iso);
    if (row) {
      result.push({
        date: iso,
        maxCapacity: row.maxCapacity,
        booked: row.currentBooked,
        remaining: Math.max(0, row.maxCapacity - row.currentBooked),
        isOpen: row.isStoreOpen,
        notes: row.notes,
        configured: true,
      });
    } else {
      const def = defaultSlotFor(iso);
      result.push({
        date: iso,
        maxCapacity: def.maxCapacity,
        booked: 0,
        remaining: def.maxCapacity,
        isOpen: def.isStoreOpen,
        notes: def.isStoreOpen ? null : "Libur rutin mingguan",
        configured: false,
      });
    }
  }
  return result;
}

/** Ketersediaan untuk jendela booking publik (besok s/d N hari ke depan) */
export async function getPublicAvailability() {
  const today = todayISO();
  return getAvailability(addDaysISO(today, 1), addDaysISO(today, config.bookingWindowDays));
}

/**
 * Memesan 1 kuota pada tanggal tertentu secara atomik (di dalam transaksi).
 * Mengembalikan id slot, atau melempar error bila penuh / toko libur.
 */
export async function reserveSlot(tx: Prisma.TransactionClient, iso: string): Promise<number> {
  const date = isoToDate(iso);
  const def = defaultSlotFor(iso);

  const slot = await tx.dailySlot.upsert({
    where: { slotDate: date },
    update: {},
    create: { slotDate: date, maxCapacity: def.maxCapacity, isStoreOpen: def.isStoreOpen },
  });

  if (!slot.isStoreOpen) throw new SlotError("Toko libur pada tanggal yang dipilih.");

  // Increment kondisional untuk mencegah overbooking ketika ada request bersamaan
  const affected = await tx.$executeRaw`
    UPDATE daily_slots
       SET current_booked = current_booked + 1, updated_at = NOW()
     WHERE id = ${slot.id} AND is_store_open = 1 AND current_booked < max_capacity`;

  if (affected === 0) throw new SlotError("Kuota pada tanggal tersebut sudah penuh.");
  return slot.id;
}

/** Mengembalikan 1 kuota (booking ditolak / dibatalkan / kedaluwarsa) */
export async function releaseSlot(tx: Prisma.TransactionClient, slotId: number) {
  await tx.$executeRaw`
    UPDATE daily_slots
       SET current_booked = GREATEST(current_booked - 1, 0), updated_at = NOW()
     WHERE id = ${slotId}`;
}

export class SlotError extends Error {}

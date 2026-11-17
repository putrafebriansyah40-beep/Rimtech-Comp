"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isoToDate } from "@/lib/dates";
import {
  confirmBooking,
  rejectBooking,
  updateServiceProgress,
  recordOfflineSettlement,
  cancelBooking,
} from "@/lib/services/booking";
import { resendWhatsappLog } from "@/lib/services/whatsapp";
import { progressSchema, rejectSchema, settlementSchema, slotSchema } from "@/lib/validations";

export async function adminLogoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function confirmBookingAction(bookingId: number) {
  const admin = await requireAdmin();
  try {
    await confirmBooking(bookingId, admin.id);
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/bookings/${bookingId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal konfirmasi booking" };
  }
}

export async function rejectBookingAction(data: { bookingId: number; reason: string }) {
  await requireAdmin();
  const parsed = rejectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    await rejectBooking(parsed.data.bookingId, parsed.data.reason);
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/bookings/${parsed.data.bookingId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menolak booking" };
  }
}

export async function cancelBookingAction(data: { bookingId: number; reason: string }) {
  await requireAdmin();
  try {
    await cancelBooking(data.bookingId, data.reason);
    revalidatePath("/admin");
    revalidatePath(`/admin/bookings/${data.bookingId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal membatalkan booking" };
  }
}

export async function updateProgressAction(data: {
  bookingId: number;
  status: "SEDANG_DIDIAGNOSA" | "SEDANG_DIPERBAIKI" | "MENUNGGU_SPAREPART" | "SELESAI";
  notes?: string;
  finalCost?: number;
}) {
  const admin = await requireAdmin();
  const parsed = progressSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    await updateServiceProgress({
      bookingId: parsed.data.bookingId,
      technicianId: admin.id,
      status: parsed.data.status,
      notes: parsed.data.notes,
      finalCost: parsed.data.finalCost,
    });
    revalidatePath("/admin");
    revalidatePath(`/admin/bookings/${parsed.data.bookingId}`);
    revalidatePath(`/lacak`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui status" };
  }
}

export async function settleOfflineAction(data: {
  bookingId: number;
  method: "CASH" | "TRANSFER";
}) {
  const admin = await requireAdmin();
  const parsed = settlementSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    await recordOfflineSettlement({
      bookingId: parsed.data.bookingId,
      technicianId: admin.id,
      method: parsed.data.method,
    });
    revalidatePath("/admin");
    revalidatePath(`/admin/bookings/${parsed.data.bookingId}`);
    revalidatePath(`/lacak`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mencatat pelunasan" };
  }
}

export async function saveSlotAction(data: {
  date: string;
  maxCapacity: number;
  isStoreOpen: boolean;
  notes?: string;
}) {
  await requireAdmin();
  const parsed = slotSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    const slotDate = isoToDate(parsed.data.date);
    await prisma.dailySlot.upsert({
      where: { slotDate },
      update: {
        maxCapacity: parsed.data.maxCapacity,
        isStoreOpen: parsed.data.isStoreOpen,
        notes: parsed.data.notes || null,
      },
      create: {
        slotDate,
        maxCapacity: parsed.data.maxCapacity,
        isStoreOpen: parsed.data.isStoreOpen,
        notes: parsed.data.notes || null,
      },
    });
    revalidatePath("/admin/slots");
    revalidatePath("/booking");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menyimpan slot" };
  }
}

export async function resendWhatsappAction(logId: number) {
  await requireAdmin();
  try {
    const ok = await resendWhatsappLog(logId);
    revalidatePath("/admin/whatsapp-logs");
    return { success: ok, error: ok ? undefined : "Gagal mengirim WhatsApp" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal kirim ulang WA" };
  }
}

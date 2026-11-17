import { z } from "zod";
import { DROP_OFF_TIMES } from "./constants";

// Validasi skema di sisi server (NFR 4.2 - Sanitasi Input)

const phoneRegex = /^(\+?62|0)8[1-9][0-9]{6,11}$/;

export const bookingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  whatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => phoneRegex.test(v), "Nomor WhatsApp tidak valid (contoh: 081234567890)"),
  email: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || z.email().safeParse(v).success, "Format email tidak valid"),
  laptopBrand: z.string().trim().min(2, "Pilih merek laptop").max(50),
  laptopModel: z.string().trim().min(2, "Tipe/seri laptop wajib diisi").max(100),
  issueDescription: z
    .string()
    .trim()
    .min(10, "Jelaskan keluhan minimal 10 karakter")
    .max(2000, "Keluhan maksimal 2000 karakter"),
  dropOffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal pengantaran"),
  dropOffTime: z.enum(DROP_OFF_TIMES, { error: "Pilih jam pengantaran" }),
});

export type BookingInput = z.input<typeof bookingSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const rejectSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  reason: z.string().trim().min(5, "Alasan penolakan minimal 5 karakter").max(1000),
});

export const progressSchema = z
  .object({
    bookingId: z.coerce.number().int().positive(),
    status: z.enum(["SEDANG_DIDIAGNOSA", "SEDANG_DIPERBAIKI", "MENUNGGU_SPAREPART", "SELESAI"]),
    notes: z.string().trim().max(2000).optional(),
    finalCost: z.coerce.number().min(0).max(1_000_000_000).optional(),
  })
  .refine((d) => d.status !== "SELESAI" || (d.finalCost !== undefined && d.finalCost > 0), {
    message: "Biaya akhir wajib diisi saat status Selesai",
    path: ["finalCost"],
  });

export const settlementSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  method: z.enum(["CASH", "TRANSFER"]),
});

export const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxCapacity: z.coerce.number().int().min(0).max(50),
  isStoreOpen: z.boolean(),
  notes: z.string().trim().max(255).optional(),
});

import type {
  BookingStatus,
  PaymentStatus,
  ServiceStatus,
  WhatsappStatus,
} from "@prisma/client";

export const STORE = {
  name: "RimTech Comp",
  tagline: "Servis Laptop Terpercaya, Tanpa Antre & Tanpa Tebak-tebakan",
  address: "Jl. Contoh Ruko No. 12, Kota Anda",
  whatsapp: "6281234567890",
  hours: "09.00 – 17.00 WIB",
  mapsUrl: "https://maps.google.com",
};

/** Pilihan jam penyerahan unit laptop ke toko */
export const DROP_OFF_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

export const LAPTOP_BRANDS = [
  "Asus",
  "Acer",
  "Lenovo",
  "HP",
  "Dell",
  "Apple",
  "MSI",
  "Toshiba",
  "Axioo",
  "Advan",
  "Lainnya",
] as const;

type Tone = "slate" | "amber" | "sky" | "emerald" | "rose" | "violet" | "zinc";

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  MENUNGGU_PEMBAYARAN: { label: "Menunggu Pembayaran", tone: "amber" },
  MENUNGGU_KONFIRMASI: { label: "Menunggu Konfirmasi", tone: "sky" },
  DIKONFIRMASI: { label: "Dikonfirmasi", tone: "violet" },
  DITOLAK: { label: "Ditolak", tone: "rose" },
  DIBATALKAN: { label: "Dibatalkan", tone: "zinc" },
  SELESAI: { label: "Selesai", tone: "emerald" },
};

export const SERVICE_STATUS: Record<
  ServiceStatus,
  { label: string; tone: Tone; description: string }
> = {
  MENUNGGU_PENYERAHAN: {
    label: "Menunggu Penyerahan Unit",
    tone: "slate",
    description: "Booking dikonfirmasi. Silakan antar laptop sesuai jadwal.",
  },
  SEDANG_DIDIAGNOSA: {
    label: "Sedang Didiagnosa",
    tone: "sky",
    description: "Teknisi sedang memeriksa sumber kerusakan laptop.",
  },
  SEDANG_DIPERBAIKI: {
    label: "Sedang Diperbaiki",
    tone: "violet",
    description: "Laptop sedang dalam proses perbaikan.",
  },
  MENUNGGU_SPAREPART: {
    label: "Menunggu Sparepart",
    tone: "amber",
    description: "Menunggu kedatangan suku cadang pengganti.",
  },
  SELESAI: {
    label: "Selesai Diperbaiki",
    tone: "emerald",
    description: "Laptop siap diambil. Pelunasan dilakukan di toko.",
  },
  DIAMBIL: {
    label: "Unit Telah Diambil",
    tone: "zinc",
    description: "Laptop telah diserahkan kembali ke pelanggan. Terima kasih!",
  },
};

/** Urutan timeline progres pengerjaan */
export const SERVICE_FLOW: ServiceStatus[] = [
  "MENUNGGU_PENYERAHAN",
  "SEDANG_DIDIAGNOSA",
  "SEDANG_DIPERBAIKI",
  "SELESAI",
  "DIAMBIL",
];

/** Status yang bisa dipilih admin saat update progres */
export const ADMIN_PROGRESS_OPTIONS: ServiceStatus[] = [
  "SEDANG_DIDIAGNOSA",
  "SEDANG_DIPERBAIKI",
  "MENUNGGU_SPAREPART",
  "SELESAI",
];

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "amber" },
  SETTLEMENT: { label: "Lunas", tone: "emerald" },
  EXPIRED: { label: "Kedaluwarsa", tone: "zinc" },
  FAILED: { label: "Gagal", tone: "rose" },
};

export const WHATSAPP_STATUS: Record<WhatsappStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "amber" },
  SUCCESS: { label: "Terkirim", tone: "emerald" },
  FAILED: { label: "Gagal", tone: "rose" },
};

export type { Tone };

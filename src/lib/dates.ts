// Utilitas tanggal. Seluruh kolom DATE MySQL direpresentasikan sebagai
// objek Date pada pukul 00:00 UTC, dan kolom TIME sebagai 1970-01-01THH:mm UTC.
// Acuan "hari ini" menggunakan zona waktu toko (Asia/Jakarta / WIB).

export const STORE_TZ = "Asia/Jakarta";

/** Tanggal hari ini (WIB) dalam format YYYY-MM-DD */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Jam sekarang (WIB) dalam format HH:mm */
export function nowTimeWIB(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: STORE_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** "2026-10-21" -> Date(2026-10-21T00:00:00Z) */
export function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Date (kolom DATE) -> "YYYY-MM-DD" */
export function dateToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "09:00" -> Date(1970-01-01T09:00:00Z) untuk kolom TIME */
export function timeToDate(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

/** Date (kolom TIME) -> "09:00" */
export function dateToTime(d: Date): string {
  return d.toISOString().slice(11, 16);
}

export function addDaysISO(iso: string, days: number): string {
  const d = isoToDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToISO(d);
}

export function weekdayOf(iso: string): number {
  return isoToDate(iso).getUTCDay();
}

/** Format tanggal Indonesia, contoh: "Rabu, 21 Oktober 2026" */
export function formatDateID(
  value: Date | string,
  opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  },
) {
  const d = typeof value === "string" ? isoToDate(value) : value;
  return new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", ...opts }).format(d);
}

/** Format timestamp (waktu nyata) ke WIB, contoh: "21 Okt 2026, 21.45" */
export function formatDateTimeWIB(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: STORE_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** YYYYMMDD berdasarkan tanggal WIB hari ini, untuk kode booking/invoice */
export function compactTodayWIB(): string {
  return todayISO().replaceAll("-", "");
}

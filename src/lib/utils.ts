export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

type Numeric = number | string | { toString(): string } | null | undefined;

export function toNumber(value: Numeric): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

export function formatRupiah(value: Numeric) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

/** Normalisasi nomor WhatsApp Indonesia ke format 628xxxxxxxxx */
export function normalizePhone(raw: string) {
  let p = raw.replace(/[^\d]/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  else if (p.startsWith("8")) p = "62" + p;
  return p;
}

/** Sembunyikan sebagian nomor WA, contoh: 6281******890 */
export function maskPhone(phone: string) {
  if (phone.length < 7) return phone;
  return phone.slice(0, 4) + "*".repeat(phone.length - 7) + phone.slice(-3);
}

/** Sembunyikan sebagian nama pelanggan untuk privasi publik, contoh: "Budi Santoso" -> "B*** S******o" */
export function maskName(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => {
      if (word.length <= 2) return word[0] + "*";
      return word[0] + "*".repeat(word.length - 2) + word.slice(-1);
    })
    .join(" ");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

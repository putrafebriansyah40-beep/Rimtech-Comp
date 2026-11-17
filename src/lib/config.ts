// Konfigurasi aturan bisnis yang dibaca dari environment variable.

function num(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  dpAmount: num(process.env.DP_AMOUNT, 50000),
  defaultDailyCapacity: num(process.env.DEFAULT_DAILY_CAPACITY, 5),
  paymentExpiryMinutes: num(process.env.PAYMENT_EXPIRY_MINUTES, 15),
  closedWeekdays: (process.env.STORE_CLOSED_WEEKDAYS ?? "0")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number),
  /** Berapa hari ke depan pelanggan boleh booking */
  bookingWindowDays: 30,
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  },
  fonnteToken: process.env.FONNTE_TOKEN ?? "",
};

export const isPaymentSimulation = () =>
  process.env.NODE_ENV !== "production" && !config.midtrans.serverKey;

export const isWhatsappSimulation = () =>
  process.env.NODE_ENV !== "production" && !config.fonnteToken;

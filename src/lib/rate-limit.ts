// Simple In-Memory Sliding Window Rate Limiter untuk proteksi DoS / Brute-force

type RateLimitRecord = {
  timestamps: number[];
};

const store = new Map<string, RateLimitRecord>();

// Bersihkan data lama setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 300_000);
    if (record.timestamps.length === 0) store.delete(key);
  }
}, 300_000).unref?.();

/**
 * Memeriksa apakah suatu identitas (IP / Key) melewati batas rate limit.
 * @param key Identifier unik (misal IP klien atau aksi)
 * @param maxRequests Maksimal request dalam kurun waktu
 * @param windowMs Rentang waktu dalam milidetik
 * @returns boolean `true` jika diperbolehkan, `false` jika melebihi batas (rate limited)
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(key) ?? { timestamps: [] };

  // Filter hanya timestamp dalam jendela waktu windowMs
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    store.set(key, record);
    return false;
  }

  record.timestamps.push(now);
  store.set(key, record);
  return true;
}

/** Mengambil IP klien dari header request */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

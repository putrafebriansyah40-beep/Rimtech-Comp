import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations";
import { BookingError, createBooking } from "@/lib/services/booking";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/** POST /api/booking - membuat booking baru & tagihan DP QRIS (FR-01..FR-03) */
export async function POST(req: Request) {
  // Rate Limiting: Maksimal 5 reservasi per menit per IP untuk mencegah Slot-Hoarding Bot
  const ip = getClientIp(req);
  if (!checkRateLimit(`booking:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan booking. Silakan tunggu 1 menit sebelum mencoba lagi." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json(
      { error: "Periksa kembali data formulir.", fieldErrors },
      { status: 422 },
    );
  }

  try {
    const result = await createBooking(parsed.data);
    return NextResponse.json({ bookingCode: result.bookingCode }, { status: 201 });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[API booking]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

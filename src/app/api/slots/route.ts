import { NextResponse } from "next/server";
import { getPublicAvailability } from "@/lib/services/slot";

export const dynamic = "force-dynamic";

/** GET /api/slots - ketersediaan kuota harian untuk kalender booking */
export async function GET() {
  const slots = await getPublicAvailability();
  return NextResponse.json({ slots });
}

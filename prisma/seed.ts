/* eslint-disable no-console */
// Seeder: akun admin awal + data contoh untuk demo dashboard.
// Jalankan: npm run db:seed

import { PrismaClient, type BookingStatus, type ServiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function todayWIB() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}
function dayOffset(days: number) {
  const d = new Date(`${todayWIB()}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
const t = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00.000Z`);
const ymd = (d: Date) => d.toISOString().slice(0, 10).replaceAll("-", "");

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      name: process.env.SEED_ADMIN_NAME ?? "Teknisi RimTech",
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      phoneNumber: process.env.SEED_ADMIN_PHONE ?? null,
    },
  });
  console.log(`✔ Admin: ${admin.username} / ${password}`);

  if ((await prisma.booking.count()) > 0) {
    console.log("ℹ Data booking sudah ada, data demo dilewati.");
    return;
  }

  const DP = Number(process.env.DP_AMOUNT ?? 50000);

  type Demo = {
    name: string;
    phone: string;
    brand: string;
    model: string;
    issue: string;
    offset: number;
    time: string;
    status: BookingStatus;
    logs?: ServiceStatus[];
    finalCost?: number;
    settled?: boolean;
  };

  const demos: Demo[] = [
    { name: "Andi Pratama", phone: "6281211110001", brand: "Asus", model: "VivoBook 14 A416", issue: "Laptop mati total setelah terkena tumpahan kopi di bagian keyboard.", offset: -9, time: "10:00", status: "SELESAI", logs: ["MENUNGGU_PENYERAHAN", "SEDANG_DIDIAGNOSA", "SEDANG_DIPERBAIKI", "SELESAI", "DIAMBIL"], finalCost: 450000, settled: true },
    { name: "Siti Rahmawati", phone: "6281211110002", brand: "Lenovo", model: "IdeaPad Slim 3", issue: "Windows sering blue screen dan sangat lambat saat booting.", offset: -6, time: "13:00", status: "SELESAI", logs: ["MENUNGGU_PENYERAHAN", "SEDANG_DIDIAGNOSA", "SEDANG_DIPERBAIKI", "SELESAI", "DIAMBIL"], finalCost: 250000, settled: true },
    { name: "Budi Santoso", phone: "6281211110003", brand: "Acer", model: "Aspire 5 A514", issue: "Engsel layar patah sebelah kanan, casing retak.", offset: -3, time: "11:00", status: "DIKONFIRMASI", logs: ["MENUNGGU_PENYERAHAN", "SEDANG_DIDIAGNOSA", "MENUNGGU_SPAREPART"] },
    { name: "Dewi Lestari", phone: "6281211110004", brand: "HP", model: "Pavilion x360", issue: "Baterai drop cepat, hanya bertahan 30 menit.", offset: -1, time: "14:00", status: "DIKONFIRMASI", logs: ["MENUNGGU_PENYERAHAN", "SEDANG_DIDIAGNOSA", "SEDANG_DIPERBAIKI", "SELESAI"], finalCost: 650000 },
    { name: "Rizky Maulana", phone: "6281211110005", brand: "MSI", model: "GF63 Thin", issue: "Overheat saat main game, kipas berisik.", offset: 1, time: "09:00", status: "DIKONFIRMASI", logs: ["MENUNGGU_PENYERAHAN"] },
    { name: "Nur Aini", phone: "6281211110006", brand: "Dell", model: "Inspiron 3501", issue: "Keyboard beberapa tombol tidak berfungsi (huruf A, S, D).", offset: 2, time: "10:00", status: "MENUNGGU_KONFIRMASI" },
    { name: "Fajar Nugroho", phone: "6281211110007", brand: "Apple", model: "MacBook Air M1 2020", issue: "Layar bergaris setelah jatuh dari meja, minta cek LCD.", offset: 2, time: "15:00", status: "MENUNGGU_KONFIRMASI" },
    { name: "Maya Puspita", phone: "6281211110008", brand: "Toshiba", model: "Satellite L745", issue: "Laptop lama minta upgrade SSD dan install ulang.", offset: 3, time: "11:00", status: "DITOLAK" },
  ];

  let seq = 0;
  for (const d of demos) {
    seq++;
    const date = dayOffset(d.offset);
    const createdAt = new Date(date.getTime() - 2 * 86400000 + 3 * 3600000);
    const holdsSlot = d.status !== "DITOLAK" && d.status !== "DIBATALKAN";

    const slot = await prisma.dailySlot.upsert({
      where: { slotDate: date },
      update: holdsSlot ? { currentBooked: { increment: 1 } } : {},
      create: { slotDate: date, maxCapacity: 5, currentBooked: holdsSlot ? 1 : 0 },
    });

    const customer = await prisma.customer.create({
      data: { fullName: d.name, whatsappNumber: d.phone, createdAt },
    });

    const code = `RMC-${ymd(createdAt)}-${String(seq).padStart(3, "0")}`;
    const remaining = d.finalCost ? Math.max(d.finalCost - DP, 0) : null;

    const booking = await prisma.booking.create({
      data: {
        bookingCode: code,
        customerId: customer.id,
        slotId: slot.id,
        laptopBrand: d.brand,
        laptopModel: d.model,
        issueDescription: d.issue,
        dropOffDate: date,
        dropOffTime: t(d.time),
        bookingStatus: d.status,
        finalCost: d.finalCost ?? null,
        remainingCost: d.settled ? 0 : remaining,
        rejectionReason:
          d.status === "DITOLAK" ? "Sparepart untuk tipe laptop ini sudah diskontinu." : null,
        createdAt,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        invoiceNumber: `INV-${ymd(createdAt)}-${String(seq).padStart(3, "0")}`,
        paymentType: "DP_QRIS",
        amount: DP,
        paymentMethod: "QRIS",
        paymentStatus: "SETTLEMENT",
        gatewayOrderId: `INV-${ymd(createdAt)}-${String(seq).padStart(3, "0")}`,
        transactionTime: new Date(createdAt.getTime() + 5 * 60000),
        createdAt,
      },
    });

    if (d.settled && remaining) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          invoiceNumber: `INV-${ymd(createdAt)}-${String(seq + 100).padStart(3, "0")}`,
          paymentType: "PELUNASAN_OFFLINE",
          amount: remaining,
          paymentMethod: seq % 2 ? "CASH" : "TRANSFER",
          paymentStatus: "SETTLEMENT",
          transactionTime: new Date(date.getTime() + 3 * 86400000),
        },
      });
    }

    const notes: Partial<Record<ServiceStatus, string>> = {
      MENUNGGU_PENYERAHAN: "Booking dikonfirmasi. Menunggu pelanggan mengantar unit laptop.",
      SEDANG_DIDIAGNOSA: "Unit diterima. Pengecekan awal komponen.",
      SEDANG_DIPERBAIKI: "Penggantian komponen yang rusak sedang dikerjakan.",
      MENUNGGU_SPAREPART: "Sparepart engsel dipesan, estimasi tiba 2-3 hari.",
      SELESAI: "Perbaikan selesai dan sudah dites normal.",
      DIAMBIL: "Pelunasan diterima. Unit diserahkan ke pelanggan.",
    };
    let logTime = createdAt.getTime() + 3600000;
    for (const s of d.logs ?? []) {
      logTime += 8 * 3600000;
      await prisma.serviceStatusLog.create({
        data: {
          bookingId: booking.id,
          technicianId: admin.id,
          status: s,
          notes: notes[s],
          createdAt: new Date(logTime),
        },
      });
    }
  }

  // Contoh hari libur khusus
  await prisma.dailySlot.upsert({
    where: { slotDate: dayOffset(5) },
    update: { isStoreOpen: false, notes: "Toko libur - acara keluarga" },
    create: { slotDate: dayOffset(5), isStoreOpen: false, notes: "Toko libur - acara keluarga" },
  });

  console.log(`✔ ${demos.length} booking demo berhasil dibuat.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

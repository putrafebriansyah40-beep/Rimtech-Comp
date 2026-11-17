import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RimTech Comp - Layanan Booking Service Laptop Terpercaya",
  description:
    "Reservasi servis laptop profesional, tracking status pengerjaan real-time, sistem slot harian teratur, dan pembayaran DP QRIS otomatis.",
  keywords: ["servis laptop", "booking service laptop", "rimtech comp", "perbaikan laptop", "tracking service"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

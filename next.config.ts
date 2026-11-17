import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aplikasi ini sangat bergantung pada data dinamis dari MySQL (slot, booking,
  // status servis), sehingga Cache Components sengaja tidak diaktifkan agar
  // seluruh halaman yang membaca database dirender per-request (SSR).
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // Security Headers (NFR 4.2 - Keamanan & Proteksi Serangan Web)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

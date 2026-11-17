import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware Pertahanan Berlapis (Defense in Depth)
 * Mencegah akses ke seluruh rute /admin/* sebelum request mencapai Server Component,
 * kecuali untuk halaman login /admin/login.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewatkan halaman login admin
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return NextResponse.next();
  }

  // Cek keberadaan cookie sesi terenkripsi NextAuth / Auth.js
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

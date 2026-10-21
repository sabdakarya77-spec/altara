import { NextResponse, type NextRequest } from "next/server";

/**
 * Guard admin (Fase 2 ROADMAP).
 *
 * Melindungi `/admin` (kecuali `/admin/login`) dan `/api/admin/*`.
 *
 * Catatan runtime: middleware berjalan di Edge Runtime, sehingga `pg` dan
 * modul `src/lib/auth.ts` TIDAK boleh diimpor di sini. Karena itu:
 *   - middleware hanya memeriksa *kehadiran* cookie, untuk UX redirect;
 *   - Route Handler `/api/admin/session` dan seluruh endpoint tulis melakukan
 *     validasi session penuh (hash token + cek kedaluwarsa) di Node Runtime.
 * Bila validasi gagal, endpoint mengembalikan 401 (fail closed).
 */

const SESSION_COOKIE = "altara_admin_session";
const PUBLIC_PATHS = ["/admin/login", "/api/admin/session", "/api/admin/login"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (hasCookie) return NextResponse.next();
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api/admin/")) {
    // Validasi penuh dilakukan di dalam Route Handler.
    if (hasCookie) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

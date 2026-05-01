import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // URL /admin ile başlıyorsa hemen durdur ve kimlik sor
  if (path.startsWith("/admin")) {
    // Zaten login sayfasındaysa engel olma, girsin
    if (path === "/admin/login") {
      return NextResponse.next();
    }

    // Cepten bileti (Cookie) kontrol et
    const bilet = request.cookies.get("kync_admin_yetki")?.value;

    // Bileti yoksa affetme, direkt gişeye (login'e) fırlat
    if (bilet !== "onaylandi") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Hem sadece /admin hem de /admin/... altındaki her yeri sıkı takibe al
  matcher: ["/admin", "/admin/:path*"],
};

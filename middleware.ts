import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "rawaes-elite-secret-key-12345";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret });

  // Admin API — JSON 401 instead of a login redirect.
  // Catalog reads stay public: the home search widgets, packages page and
  // booking wizard fetch these without a session.
  if (pathname.startsWith("/api/admin")) {
    const publicCatalogGets = new Set([
      "/api/admin/cities",
      "/api/admin/airports",
      "/api/admin/flights",
      "/api/admin/returning-flights",
      "/api/admin/transports",
    ]);
    if (req.method === "GET" && publicCatalogGets.has(pathname)) {
      return NextResponse.next();
    }
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح — يتطلب تسجيل دخول المشرف" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Admin area — requires an admin session
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }
    if (!token || token.role !== "admin") {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // The package wizard is public — auth is only enforced when the
  // booking is actually submitted (POST /api/booking)
  if (pathname.startsWith("/booking/wizard")) {
    return NextResponse.next();
  }

  // Client area — requires any authenticated session
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Admin area + admin API + client-facing protected pages
  matcher: ["/admin/:path*", "/api/admin/:path*", "/booking/:path*"],
};

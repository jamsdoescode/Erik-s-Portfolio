import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET_BYTES } from "@/lib/jwt-secret";

const COOKIE_NAME = "site_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdmin && !isLogin) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET_BYTES);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (isLogin && token) {
    try {
      await jwtVerify(token, JWT_SECRET_BYTES);
      return NextResponse.redirect(new URL("/admin", request.url));
    } catch {
      // allow login page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET_BYTES } from "@/lib/jwt-secret";
import { extractSubdomain } from "@/lib/root-domain";

const COOKIE_NAME = "site_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const subdomain = extractSubdomain(host);

  if (
    subdomain &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/companies/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/companies/${subdomain}`;
    return NextResponse.rewrite(url);
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

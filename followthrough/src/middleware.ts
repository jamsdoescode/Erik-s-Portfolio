import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "followthrough-dev-secret"
);
const COOKIE_NAME = "ft_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isApp = pathname.startsWith("/app");
  const isAuth = pathname === "/login" || pathname === "/signup";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isApp) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await jwtVerify(token, SECRET);
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAuth && token) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.redirect(new URL("/app", request.url));
    } catch {
      // invalid token, allow auth page
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};

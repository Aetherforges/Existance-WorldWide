import { NextResponse } from "next/server";

export function middleware(request) {
  const adminCookie = request.cookies.get("admin_session");
  if (!adminCookie) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

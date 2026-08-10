import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname === "/sign-up";

  const isPublicRoute =
    pathname === "/" ||
    isAuthRoute ||
    pathname.startsWith("/_next/") ||
    /\.[^/]+$/.test(pathname);

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
import { NextRequest, NextResponse } from "next/server";

const GATE_ENABLED = process.env.LAUNCH_GATE_ENABLED === "true";

const ALLOWED_PATHS = new Set<string>([
  "/",
  "/launching",
  "/api/cron/daily-broadcast",
]);

const ALLOWED_PREFIXES = ["/api/auth/"];

export function proxy(req: NextRequest) {
  if (!GATE_ENABLED) return NextResponse.next();

  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/launching";
    return NextResponse.rewrite(url);
  }

  if (
    ALLOWED_PATHS.has(pathname) ||
    ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\..*).*)",
  ],
};

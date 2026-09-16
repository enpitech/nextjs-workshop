// proxy.ts (middleware.ts before Next 16). Runs on the Node.js runtime before
// every matched request. This is the only "auth" in the demo: /admin redirects home.
// Setting `export const runtime` here throws; the edge runtime is not supported in proxy.
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

// Comment the matcher out and the redirect fires on every route, with no error (1.6a‴).
export const config = {
  matcher: ["/admin/:path*"],
};

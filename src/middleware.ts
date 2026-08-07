import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { EDITOR_COOKIE_NAME, verifyEditorSession } from "./lib/editor/auth";

const intlMiddleware = createMiddleware(routing);

// Requests to these exact paths must reach the app even when the visitor
// isn't logged in yet — the login page itself and the endpoint it posts to.
// /api/editor/upload is also here: Vercel's blob service calls it directly
// (with no session cookie) to confirm an upload completed, so the route
// checks the editor cookie itself instead of relying on this gate.
const EDITOR_PUBLIC_PATHS = new Set([
  "/editor/login",
  "/api/editor/login",
  "/api/editor/upload",
]);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/editor") || pathname.startsWith("/api/editor")) {
    if (EDITOR_PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next();
    }
    const token = req.cookies.get(EDITOR_COOKIE_NAME)?.value;
    const authed = await verifyEditorSession(token);
    if (!authed) {
      if (pathname.startsWith("/api/editor")) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/editor/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  // Skip Next.js internals, API routes, static files, /portal (a local,
  // non-localized InDesign-prep tool), and /editor (gated separately below,
  // not locale-routed) for the next-intl middleware. /editor and
  // /api/editor are matched explicitly afterward so the password check
  // above still runs for them.
  matcher: [
    "/((?!api|_next|_vercel|portal|editor|.*\\..*).*)",
    "/editor/:path*",
    "/api/editor/:path*",
  ],
};

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals, API routes, static files, and the public folder.
  // Run on everything else so the locale prefix is correctly enforced.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

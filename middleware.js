/* =========================================================================
   EDGE MIDDLEWARE — gate the paid guide.
   Runs at Vercel's edge before the static files are served. Any request to a
   protected path without a valid session cookie is redirected to the login
   flow (Whop OAuth). Buyers with a valid session pass straight through — the
   pages, UI and functionality are unchanged.
   ========================================================================= */
import { SESSION_COOKIE, verifySession, parseCookies } from "./lib/session.js";

export const config = {
  matcher: [
    "/guide.html",
    "/stores.html",
    "/avoid.html",
    "/optimize.html",
    "/tools.html",
    "/plan.html",
    "/sources.html",
    // guide-only data/logic (the actual "tools" you built)
    "/assets/stores-data.js",
    "/assets/meals-data.js",
    "/assets/plan.js"
  ]
};

export default async function middleware(request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const payload = await verifySession(cookies[SESSION_COOKIE]);
  if (payload && payload.access === true) {
    return; // authorised — continue to the static file
  }
  const url = new URL(request.url);
  const login = new URL("/api/auth/login", url.origin);
  login.searchParams.set("redirect", url.pathname);
  return Response.redirect(login.toString(), 302);
}

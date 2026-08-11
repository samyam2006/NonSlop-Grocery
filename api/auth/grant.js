/* =========================================================================
   /api/auth/grant — private, code-based free access (for coaching clients).
   A visitor who opens  /api/auth/grant?code=YOUR_CODE  with a code that
   matches ACCESS_CODES gets the SAME signed session cookie a paid login
   issues, and is sent straight into the guide. No Whop, no payment.

   Set ACCESS_CODES in Vercel to one or more secret codes, comma-separated,
   e.g.  ACCESS_CODES=omar-clients-2026,vip-crew
   Rotate anytime by changing the env var (old links stop working, and any
   already-issued 30-day sessions expire on their own).
   ========================================================================= */
import { serializeCookie, signSession, SESSION_COOKIE } from "../../lib/session.js";

function validCodes() {
  return String(process.env.ACCESS_CODES || process.env.ACCESS_CODE || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  const landing = process.env.LANDING_URL || "/index.html";
  const code = typeof req.query.code === "string" ? req.query.code.trim() : "";
  const codes = validCodes();

  // No code configured, or wrong/empty code → send to the public landing page.
  if (!codes.length || !code || !codes.includes(code)) {
    res.statusCode = 302;
    res.setHeader("Location", landing);
    res.end();
    return;
  }

  // Optional ?redirect=/somewhere.html (must be a same-site path).
  let target = "/guide.html";
  const r = req.query.redirect;
  if (typeof r === "string" && r.startsWith("/")) target = r;

  const jwt = await signSession({ access: true, sub: "comp", comp: true });
  const session = serializeCookie(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });
  res.statusCode = 302;
  res.setHeader("Set-Cookie", session);
  res.setHeader("Location", target);
  res.end();
}

/* =========================================================================
   /api/auth/login — begin the Whop OAuth flow.
   Redirects the visitor to Whop to authenticate, carrying a signed `state`
   (also stored in a short-lived cookie for CSRF) that remembers where to send
   them back to after login.
   ========================================================================= */
import { serializeCookie } from "../../lib/session.js";

function b64url(str) {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function handler(req, res) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback`;

  const wanted = typeof req.query.redirect === "string" && req.query.redirect.startsWith("/")
    ? req.query.redirect
    : "/guide.html";
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const state = b64url(JSON.stringify({ r: wanted, n: nonce }));

  const authorize = process.env.WHOP_OAUTH_AUTHORIZE_URL || "https://whop.com/oauth";
  const u = new URL(authorize);
  u.searchParams.set("client_id", process.env.WHOP_CLIENT_ID || "");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  if (process.env.WHOP_OAUTH_SCOPE) u.searchParams.set("scope", process.env.WHOP_OAUTH_SCOPE);
  u.searchParams.set("state", state);

  res.setHeader(
    "Set-Cookie",
    serializeCookie("oauth_state", state, { httpOnly: true, secure: true, sameSite: "Lax", maxAge: 600, path: "/" })
  );
  res.statusCode = 302;
  res.setHeader("Location", u.toString());
  res.end();
}

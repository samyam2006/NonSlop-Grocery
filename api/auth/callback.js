/* =========================================================================
   /api/auth/callback — finish the Whop OAuth flow.
   1. Verify state (CSRF).
   2. Exchange the auth code for an access token.
   3. Check the user actually has an active membership to this product.
   4. Access → set a signed session cookie and send them to the guide.
      No access → send them to checkout. Any failure → landing page.
   ========================================================================= */
import { serializeCookie, parseCookies, signSession, SESSION_COOKIE } from "../../lib/session.js";
import { hasAccess } from "../_whop.js";

function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(s, "base64").toString("utf8");
}
function redirect(res, location, cookies) {
  if (cookies) res.setHeader("Set-Cookie", cookies);
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

export default async function handler(req, res) {
  const checkout = process.env.CHECKOUT_URL || "https://whop.com/checkout/plan_ar9QvSBZ4fyDG";
  const landing = process.env.LANDING_URL || "/index.html";
  const clearState = serializeCookie("oauth_state", "", { maxAge: 0, path: "/" });

  const { code, state, error } = req.query;
  const cookies = parseCookies(req.headers.cookie);
  if (error || !code || !state || state !== cookies["oauth_state"]) {
    return redirect(res, landing, clearState);
  }

  let target = "/guide.html";
  try {
    const d = JSON.parse(b64urlDecode(state));
    if (typeof d.r === "string" && d.r.startsWith("/")) target = d.r;
  } catch {}

  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  // Exchange code → access token
  let tokenJson = null;
  try {
    const tr = await fetch(process.env.WHOP_OAUTH_TOKEN_URL || "https://api.whop.com/v5/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: redirectUri
      })
    });
    tokenJson = await tr.json();
  } catch (e) {
    console.error("[whop] token exchange threw:", e);
    return redirect(res, landing, clearState);
  }

  const accessToken = tokenJson && (tokenJson.access_token || tokenJson.token);
  if (!accessToken) {
    console.error("[whop] no access_token in token response:", tokenJson);
    return redirect(res, landing, clearState);
  }

  let result = { ok: false, userId: null };
  try {
    result = await hasAccess(accessToken);
  } catch (e) {
    console.error("[whop] access check threw:", e);
  }

  if (!result.ok) {
    // Authenticated but hasn't bought → send to checkout.
    return redirect(res, process.env.UNPAID_REDIRECT || checkout, clearState);
  }

  const jwt = await signSession({ access: true, sub: result.userId || "user" });
  const session = serializeCookie(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });
  return redirect(res, target, [session, clearState]);
}

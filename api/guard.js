/* =========================================================================
   /api/guard — the paywall.
   Every protected URL (guide.html, stores.html, the guide-only data files,
   …) is rewritten to this function by vercel.json. The real files live under
   api/_content/ which Vercel never serves statically — so there is no way to
   reach them except through this check. A valid Whop session cookie → the file
   is streamed back byte-for-byte (UI and behaviour unchanged). No session →
   the visitor is sent to the Whop login/checkout flow.
   ========================================================================= */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SESSION_COOKIE, verifySession, parseCookies } from "../lib/session.js";

/* Allow-list: public path → [file on disk under project root, content-type].
   Nothing outside this map can ever be served, so a crafted ?p= is harmless. */
const HTML = "text/html; charset=utf-8";
const JS = "application/javascript; charset=utf-8";
const FILES = {
  "guide.html":   ["api/_content/guide.html", HTML],
  "stores.html":  ["api/_content/stores.html", HTML],
  "avoid.html":   ["api/_content/avoid.html", HTML],
  "optimize.html":["api/_content/optimize.html", HTML],
  "tools.html":   ["api/_content/tools.html", HTML],
  "plan.html":    ["api/_content/plan.html", HTML],
  "sources.html": ["api/_content/sources.html", HTML],
  "cheatsheet.html": ["api/_content/cheatsheet.html", HTML],
  "assets/stores-data.js": ["api/_content/assets/stores-data.js.txt", JS],
  "assets/meals-data.js":  ["api/_content/assets/meals-data.js.txt", JS],
  "assets/plan.js":        ["api/_content/assets/plan.js.txt", JS]
};

export default async function handler(req, res) {
  const key = typeof req.query.p === "string" ? req.query.p : "";
  const entry = FILES[key];
  if (!entry) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  // Gate: require a valid, paid session.
  const cookies = parseCookies(req.headers.cookie);
  const payload = await verifySession(cookies[SESSION_COOKIE]);
  if (!payload || payload.access !== true) {
    res.statusCode = 302;
    res.setHeader("Location", `/api/auth/login?redirect=${encodeURIComponent("/" + key)}`);
    res.end();
    return;
  }

  // Authorised — serve the protected file untouched.
  const [file, type] = entry;
  let body;
  try {
    body = readFileSync(join(process.cwd(), file));
  } catch (e) {
    console.error("[guard] could not read", file, e);
    res.statusCode = 500;
    res.end("Server error");
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "private, no-store");
  res.end(body);
}

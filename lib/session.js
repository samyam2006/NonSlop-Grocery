/* =========================================================================
   Session helpers — signed JWT cookie. Edge-safe (no Node-only APIs):
   used by both the Edge Middleware and the Node serverless auth routes.
   ========================================================================= */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "nonslop_session";

function secretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET || "");
}

export async function signSession(payload, expiresIn = "30d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export async function verifySession(token) {
  if (!token || !process.env.SESSION_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > -1) {
      const k = part.slice(0, i).trim();
      out[k] = decodeURIComponent(part.slice(i + 1).trim());
    }
  });
  return out;
}

export function serializeCookie(name, value, opts = {}) {
  let s = `${name}=${encodeURIComponent(value)}`;
  if (opts.maxAge != null) s += `; Max-Age=${opts.maxAge}`;
  s += `; Path=${opts.path || "/"}`;
  if (opts.httpOnly) s += "; HttpOnly";
  if (opts.secure !== false) s += "; Secure";
  s += `; SameSite=${opts.sameSite || "Lax"}`;
  return s;
}

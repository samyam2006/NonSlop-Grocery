/* /api/auth/logout — clear the session and return to the landing page. */
import { serializeCookie, SESSION_COOKIE } from "../../lib/session.js";

export default function handler(req, res) {
  res.setHeader("Set-Cookie", serializeCookie(SESSION_COOKIE, "", { maxAge: 0, path: "/" }));
  res.statusCode = 302;
  res.setHeader("Location", process.env.LANDING_URL || "/index.html");
  res.end();
}

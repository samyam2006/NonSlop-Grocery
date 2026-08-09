/* =========================================================================
   WHOP access check.
   Given the authenticated user's OAuth access token, determine whether they
   currently hold an active membership to this product. Endpoints/IDs are
   env-configurable so a change in Whop's API version is a config change, not
   a code change. The matcher is deliberately tolerant of response shape.
   ========================================================================= */

const API_BASE = () => (process.env.WHOP_API_BASE || "https://api.whop.com").replace(/\/$/, "");

function configuredIds() {
  return [
    process.env.WHOP_ACCESS_PASS_ID,
    process.env.WHOP_PRODUCT_ID,
    process.env.WHOP_PLAN_ID
  ].filter(Boolean);
}

async function json(url, token) {
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function membershipMatch(data, ids) {
  const list = Array.isArray(data) ? data : (data && (data.data || data.memberships)) || [];
  if (!Array.isArray(list)) return false;
  return list.some((m) => {
    const status = String(m.status || m.state || m.valid || "").toLowerCase();
    const active =
      m.valid === true ||
      ["active", "completed", "trialing", "valid", "true", "past_due"].includes(status);
    if (!active) return false;
    if (ids.length === 0) return true; // no ID configured → any active membership counts
    const fields = [
      m.access_pass_id, m.product_id, m.plan_id, m.page_id,
      m.access_pass, m.product, m.plan
    ]
      .map((x) => (x && typeof x === "object" ? x.id : x))
      .filter(Boolean)
      .map(String);
    return ids.some((id) => fields.includes(id));
  });
}

/**
 * @returns {Promise<{ ok: boolean, userId: string|null }>}
 */
export async function hasAccess(userAccessToken) {
  const base = API_BASE();
  const ids = configuredIds();

  // Who is the user?
  let userId = null;
  const me = await json(`${base}/v5/me`, userAccessToken);
  if (me) userId = me.id || (me.user && me.user.id) || (me.data && me.data.id) || null;

  // Preferred: company API key checks this user's memberships to the access pass.
  const apiKey = process.env.WHOP_API_KEY;
  if (apiKey && userId) {
    const pass = ids[0] ? `&access_pass_id=${encodeURIComponent(ids[0])}` : "";
    const urls = [
      `${base}/v5/memberships?user_id=${encodeURIComponent(userId)}${pass}`,
      `${base}/v2/memberships?user_id=${encodeURIComponent(userId)}${pass}`
    ];
    for (const u of urls) {
      const d = await json(u, apiKey);
      if (d && membershipMatch(d, ids)) return { ok: true, userId };
    }
  }

  // Fallback: the user's own token lists their memberships.
  for (const u of [`${base}/v5/me/memberships`, `${base}/v2/me/memberships`]) {
    const d = await json(u, userAccessToken);
    if (d && membershipMatch(d, ids)) return { ok: true, userId };
  }

  return { ok: false, userId };
}

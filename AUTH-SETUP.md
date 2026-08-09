# Locking the guide with Whop — Vercel setup

This adds real, server-side access control. Non-buyers who type `guide.html`
(or any guide route) are sent to log in with Whop; if they haven't bought, they
land on checkout. Buyers pass straight through. **Your pages, UI and tools are
unchanged** — this is a separate auth layer wrapped around them.

## How it works
```
visitor → /guide.html
      → Edge Middleware checks for a valid session cookie
          ├─ valid   → serve the guide (unchanged)
          └─ none    → /api/auth/login → Whop OAuth login
                          → /api/auth/callback
                              ├─ has active membership → set cookie → guide
                              └─ no membership         → Whop checkout
```
Protected: `guide/stores/avoid/optimize/tools/plan/sources.html` **and** the
guide-only data files (`assets/stores-data.js`, `assets/meals-data.js`,
`assets/plan.js`). Public (unchanged): `index.html`, `assets/style.css`,
`assets/app.js`, the intro video.

---

## Step 1 — Deploy to Vercel
1. Push this repo to GitHub (done) and import it at **vercel.com → New Project**.
2. Framework preset: **Other**. No build command needed. Deploy.
3. You'll get a URL like `https://nonslop-grocery.vercel.app` (add your custom
   domain later if you want).

## Step 2 — Create a Whop OAuth app
1. Whop dashboard → **Developer → OAuth apps → Create**.
2. Set the **Redirect URI** to exactly:
   `https://YOUR-VERCEL-DOMAIN/api/auth/callback`
   (add one for each domain you use, including the custom domain).
3. Copy the **Client ID** and **Client Secret**.
4. Also create an **API key** (Developer → API keys) — used to verify memberships.

## Step 3 — Set environment variables in Vercel
Vercel → your project → **Settings → Environment Variables**. Add (see
`.env.example` for the full list with notes):

| Variable | Value |
|---|---|
| `WHOP_CLIENT_ID` | from the OAuth app |
| `WHOP_CLIENT_SECRET` | from the OAuth app |
| `WHOP_API_KEY` | your Whop API key |
| `WHOP_ACCESS_PASS_ID` | the product/access-pass id for this guide (prod_… / pass_…) |
| `WHOP_PLAN_ID` | `plan_ar9QvSBZ4fyDG` (already the default) |
| `SESSION_SECRET` | a long random string — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CHECKOUT_URL` | `https://whop.com/checkout/plan_ar9QvSBZ4fyDG` |
| `LANDING_URL` | `/index.html` |

**Redeploy** after adding them (env changes need a new deploy).

## Step 4 — Point Whop's product delivery at the guide
In your Whop product → **Add app/experience → Link** → set it to
`https://YOUR-VERCEL-DOMAIN/guide.html`. After buying, members click that and
the auth flow logs them in automatically.

## Step 5 — Test
1. Open `https://YOUR-VERCEL-DOMAIN/guide.html` in a private window while **not**
   a member → you should be sent to Whop login, then to **checkout**.
2. Buy (or give your own account a free/comp membership in Whop), then open the
   guide again → you should pass straight through.
3. Public `index.html` should always load without login.

---

## Notes & troubleshooting
- **Endpoints are configurable.** If Whop's OAuth authorize/token URLs differ
  for your app, override `WHOP_OAUTH_AUTHORIZE_URL`, `WHOP_OAUTH_TOKEN_URL`,
  `WHOP_API_BASE`, `WHOP_OAUTH_SCOPE` (see `.env.example`). Defaults follow
  Whop's documented v5 OAuth — confirm against Whop's current OAuth docs.
- **Debugging:** the callback logs to Vercel (Deployments → Functions logs) when
  a token exchange or access check fails, and prints the raw response shape so
  the membership match can be adjusted if needed.
- **Session length:** 30 days, then a silent re-login. Change `expiresIn` in
  `lib/session.js`.
- **Not a paywall bypass:** the guide files are only served after the edge
  middleware verifies the cookie, so typing the URL directly can't reveal them.
- This does **not** change anything about how the guide looks or works for a
  paying member.

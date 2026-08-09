# Locking the guide with Whop — Vercel setup

This adds real, server-side access control. Non-buyers who type `guide.html`
(or any guide route) are sent to log in with Whop; if they haven't bought, they
land on checkout. Buyers pass straight through. **Your pages, UI and tools are
unchanged** — this is a separate auth layer wrapped around them.

## How it works
```
visitor → /guide.html
      → vercel.json rewrite → /api/guard  (serverless function)
          → checks for a valid, paid session cookie
              ├─ valid → reads the real file from api/_content/ and
              │          streams it back byte-for-byte (UI unchanged)
              └─ none  → /api/auth/login → Whop OAuth login
                             → /api/auth/callback
                                 ├─ active membership → set cookie → guide
                                 └─ no membership     → Whop checkout
```
**Why this is airtight:** the protected pages and the guide-only data files do
**not exist as static files** on the site. They live in `api/_content/`, which
Vercel never serves. The *only* way to reach them is through `/api/guard`,
which serves them only after the paywall check. If auth were somehow
misconfigured, typing `/guide.html` returns a redirect or 404 — never the guide.

Protected: `guide/stores/avoid/optimize/tools/plan/sources.html` **and** the
guide-only data (`assets/stores-data.js`, `assets/meals-data.js`,
`assets/plan.js`). Public (unchanged): `index.html`, `assets/style.css`,
`assets/app.js`, the intro video.

> **This protection lives on the `claude/access-verification-p56u37` branch.**
> Vercel must deploy *this* branch (or you must merge it into the branch Vercel
> deploys). If Vercel is building `main` and the auth code isn't there yet, the
> site has no lock. In Vercel → Settings → Git you can set the Production
> Branch, or open a PR and merge this into your deployed branch.

---

## Step 1 — Deploy to Vercel
1. Push this repo to GitHub (done) and import it at **vercel.com → New Project**.
2. Framework preset: **Other**. No build command needed. Deploy.
3. You'll get a URL like `https://nonslop-grocery.vercel.app` (add your custom
   domain later if you want).

## Step 2 — Get your Whop OAuth credentials
On the Whop **Developer** page you already have open:
1. Find the **“OAuth (deprecated)”** section — *“Allow users to login with Whop
   on your own website.”* (Despite the “deprecated” label this is the login flow
   we use; it still works.) Expand it.
2. Set the **Redirect URI** to exactly:
   `https://non-slop-grocery.vercel.app/api/auth/callback`
   (add one line per domain you use, including any custom domain).
3. Copy the **Client ID** and **Client Secret** shown there.
4. Scroll up to **API keys** on the same Developer page and create/copy an
   **API key** — used to verify a buyer’s membership server-side.

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
- **Not a paywall bypass:** the guide files are only served after `/api/guard`
  verifies the cookie, and they aren't static files at all, so typing the URL
  directly can't reveal them.
- This does **not** change anything about how the guide looks or works for a
  paying member.

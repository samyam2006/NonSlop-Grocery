# Selling the NonSlop Grocery Navigator — Setup (Whop)

You have two parts:

1. **A public sales page** — `index.html`. Anyone can see it. Its job is to sell.
2. **The paid guide (members area)** — `guide.html`, `stores.html`, `avoid.html`,
   `optimize.html`, `tools.html` and everything in `assets/`. This is what a
   buyer unlocks for **$50**.

Payments and access are handled by **Whop** — you do **not** build your own
login or take card details yourself.

> **Reality check:** static files by themselves can't be "locked." A person
> with the direct URL to `guide.html` could open it. Real access control is
> what Whop provides (checkout + a members area / gated content). Follow one of
> the two delivery options below.

---

## Step 1 — Create the product in Whop

1. Sign in at **whop.com** and create a **Company/Store**.
2. Add a **Product**, then a **Pricing Plan**: **one-time, $50**.
3. Connect your payout method (Whop handles the card processing).
4. Copy the product's **checkout link** — it looks like
   `https://whop.com/checkout/plan_XXXXXXXXXXXX` (or your product page URL,
   `https://whop.com/your-store/your-product/`).

## Step 2 — Point the site's buy button at Whop

In `index.html`, find the button with `id="buyBtn"` (it's wrapped in a big
`REPLACE` comment):

```html
<!-- ▼▼▼ REPLACE href BELOW WITH YOUR WHOP CHECKOUT URL ▼▼▼ -->
<a class="btn btn-lg" id="buyBtn" href="#" data-whop>Get instant access →</a>
```

Change `href="#"` to your Whop checkout link. That's the only wiring the page
needs. (The other "Get access" buttons just scroll to this one.)

*Optional — open checkout in a modal instead of a new page:* add Whop's embed
script from their dashboard docs and give the button the attributes Whop
specifies. The plain link above works fine on its own.

## Step 3 — Deliver the guide to buyers (pick ONE)

**Option A — Gate the guide inside Whop (cleanest).**
Whop products can include gated content / an app members open after purchase.
Put the guide there:
- Host the guide files (see Step 4) and add the members' URL as the product's
  delivered content / a Whop "link" app, **or** paste the guide pages into
  Whop's content blocks.
- Buyers get access in their Whop dashboard automatically after paying.

**Option B — Redirect + unlisted link (simplest).**
- Set the product's **post-checkout redirect** (or the delivered content) to
  your hosted `guide.html`.
- Keep that `guide.html` URL **unlisted** — don't link to it publicly except
  through Whop's post-purchase delivery.
- (Good enough for launch; not hard security. Option A is stronger.)

## Step 4 — Host the files

Any static host works, most are free:

- **Netlify** or **Cloudflare Pages** — drag-and-drop the folder.
- **GitHub Pages** — already on GitHub; enable Pages for the branch.
- **Vercel** — connect the repo.

For Option A/B, host the whole folder and keep `guide.html` unlisted.

---

## Optional — verify entitlement automatically (advanced)

If you later want the guide page itself to check that the visitor actually
bought (so a shared link stops working), Whop has a **License / membership API**
and OAuth. That needs a tiny bit of backend (a serverless function that calls
Whop's API with your API key and returns yes/no). Ask and this can be wired up;
for launch, Options A/B are enough.

---

## Pricing & trust notes

- **$50 is defensible because of the interactive tools** (searchable directory
  + live calculator) and the depth of content. Lead with those.
- Set a **refund policy** in Whop — the page mentions a 14-day guarantee.
- Consider a cheaper **PDF-only tier** (~$15–20) in Whop as a downsell, keeping
  the $50 interactive system as the main plan.
- Keep the page's claims true: "no ads / no affiliate links," "lifetime access
  & free updates."

## Legal / compliance

- Keep the educational-only, not-medical-advice disclaimers (already on every page).
- Add short **Terms** and **Refund** info (Whop can host these too).

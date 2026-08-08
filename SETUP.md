# Selling the NonSlop Grocery Navigator — Setup Guide

You now have two parts:

1. **A public sales page** — `index.html`. Anyone can see it. Its job is to sell.
2. **The paid guide (members area)** — `guide.html`, `stores.html`, `avoid.html`,
   `optimize.html`, `tools.html` and everything in `assets/`. This is what a
   buyer unlocks for **$50**.

> **Important reality check:** static files by themselves cannot be "locked."
> A determined person who has the URL to `guide.html` could open it. Real
> access control happens on a **payment/membership platform** that puts the
> content behind a login. The three recommended routes below all do this for
> you — you do **not** build your own login. Pick one.

---

## Route A — Payhip (fastest, lowest friction)

Best if you want to be selling by tonight.

1. Create a free account at **payhip.com** and connect Stripe/PayPal.
2. Create a new product. You have two good options:
   - **Membership / digital product that links to the guide.** Host the guide
     files (see "Where to host" below) and, after purchase, Payhip shows the
     buyer the private link + gives them a login.
   - **Or** upload a companion PDF *and* include the private web-app link in the
     buyer-only "thank you" content.
3. Set the price to **$50**, one-time.
4. Copy your product's **checkout/buy link**.
5. In `index.html`, find the button with `id="buyBtn"` and replace its
   `href="#"` with that checkout link. (There are big `REPLACE` comments around
   it.) Do the same for any other CTA if you want them to go straight to checkout
   instead of scrolling to the pricing section.

## Route B — Gumroad

Same idea, huge audience, slightly higher fees.

1. Create a product at **gumroad.com**, price **$50**.
2. Put the private guide link (and/or a PDF) in the product's post-purchase
   "content" area, which only buyers can see.
3. Copy the Gumroad product URL → paste into `#buyBtn` in `index.html`.
4. Optional: Gumroad "overlay" checkout keeps buyers on your page.

## Route C — Ghost (most professional, real memberships)

Best if you want this to feel like a real publication with proper member logins.

1. Start a site at **ghost.org** (hosted ~$9/mo) or self-host (free).
2. Turn on **Memberships** and connect **Stripe**. Create a **$50 one-time**
   or paid tier.
3. Recreate the five guide pages as **members-only pages/posts** inside Ghost
   (paste the content in; Ghost handles the paywall and login automatically).
4. Use `index.html` as your public landing page (Ghost can host a custom
   homepage, or keep this page and point its CTA at your Ghost signup URL).

---

## Where to host the files

Any static host works, most are free:

- **Netlify** or **Cloudflare Pages** — drag-and-drop the folder, done.
- **GitHub Pages** — already in GitHub; enable Pages on the branch.
- **Vercel** — connect the repo.

For Routes A/B, host the whole folder and keep the `guide.html` URL
**unlisted** (don't link to it publicly except through the buyer's receipt).
For Route C, the guide lives inside Ghost and this hosting only serves the
landing page.

---

## The one edit you must make

In `index.html`:

```html
<!-- ▼▼▼ REPLACE href BELOW WITH YOUR CHECKOUT URL ▼▼▼ -->
<a class="btn btn-lg" id="buyBtn" href="#">Get instant access →</a>
```

Change `href="#"` to your real checkout link. That's the only wiring the page
needs.

---

## Pricing & trust notes

- **$50 is defensible only because of the interactive tools** (the searchable
  directory + live calculator) and the depth of the content. Lead with those.
- Add a **money-back guarantee** in your checkout platform — it measurably
  raises conversions and is already mentioned on the page.
- Consider a **cheaper "PDF-only" tier** ($15–20) as a downsell, and keep the
  $50 tier as the full interactive system.
- The page claims "no ads / no affiliate links" and "lifetime access & free
  updates" — keep those true.

## Legal / compliance

- Keep the educational-only, not-medical-advice disclaimers (already on every
  page).
- Add a short **Terms** and **Refund policy** page if your platform doesn't
  supply one.
- Verify any specific brand/sourcing claims stay accurate as you update.

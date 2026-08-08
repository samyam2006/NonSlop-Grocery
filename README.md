# The NonSlop Grocery Navigator

An independent, ad-free field guide to buying real food anywhere in the world.
No sponsors, no affiliate links — just the ingredient list, read honestly.

A static, multi-page site with a black-and-white editorial design, packaged as
a **paid product ($50, one-time)**: a public sales page in front of a members
guide. Open `index.html` in any browser; no build step or server required.

## Pages

**Public**

| File | What it covers |
|------|----------------|
| `index.html` | **Sales / landing page** — sells the guide, lists what's inside, pricing, FAQ, and the $50 CTA. |

**The paid guide (members area)**

| File | What it covers |
|------|----------------|
| `guide.html` | Home — a long introduction on why real food became hard to find, and the seven core rules. |
| `stores.html` | A searchable directory of **141 grocery stores** across 7 world regions, with what to buy at each. |
| `avoid.html` | What to avoid no matter what, a secret-ingredient decoder, and fake-healthy foods exposed. |
| `optimize.html` | What to eat for health, hormones and mental clarity, plus a **superfood sourcing map**. |
| `tools.html` | A real-food **budget calculator**, free clean-water sources, and a clean hygiene-product list. |

## Selling it

See **[SETUP.md](SETUP.md)** — how to wire up payment (Payhip / Gumroad / Ghost),
gate the members area, and the single `href` you need to edit in `index.html`.

## Structure

```
assets/
  style.css        Shared black-and-white editorial design system
  app.js           Nav, store search/filter, budget calculator
  stores-data.js   The 141-store directory dataset
```

## Editing the store directory

All stores live in `assets/stores-data.js` as plain objects:

```js
{ name, country, region, type, price /* $ | $$ | $$$ */, buy, tip }
```

`region` must be one of the values in the `REGIONS` array at the top of the file.

## Disclaimer

Educational only — not medical, dietary, or safety advice. Store sourcing and
labelling change; verify grass-fed / organic / wild-caught claims locally.
Water safety is local — never assume a spring, well, or foreign tap is safe
without a current test.

# MTNShade Custom Mug Studio + CRM

Co-branded MTNShade "Crimp Mug" configurator for climbing gyms, plus an internal CRM.
Live at **mtnshade.com/customize/** (studio) and **/crm.html** (CRM). Hosted on Netlify, deployed from this GitHub repo — every push to `main` goes live in ~1 minute.

## How to work in this repo
- Edit files in `src/` only. Never edit `dist/` (generated).
- `node build.mjs` → builds `dist/index.html` and `dist/crm.html` (CSS + scripts inlined). Netlify runs it automatically.
- Local preview with backend: `npx netlify-cli dev` (needs env vars below). Without backend: `node build.mjs && npx serve dist` — the CRM falls back to demo data.
- No bundler/npm for the front end: React 18 + Babel standalone + three.js r149 load from CDNs; JSX files are plain browser scripts that share globals via `Object.assign(window,{…})`. Keep that pattern. Each file's top-level `const` names must be unique (e.g. `crmLbl`, `oMuted`) because all scripts share one page.
- Styling is inline styles using CSS variables from `src/tokens/*.css` (MTNShade design system). Use tokens, not new hex colors.
- `src/_ds_bundle.js` is the compiled MTNShade design system (Button, Input, Select, Card, Badge, TabBar, Logo, Switch, Checkbox, QuantityStepper, Dialog, Toast) exposed as `window.MTNShadeDesignSystem_e114fa`. Treat it as a vendored library; don't hand-edit.
- After any change: run `node build.mjs`, open the page, check the console is clean, then commit + push.

## Business rules (source of truth: `src/ui_kits/mug-customizer/mc-config.js`)
- Mug body: brushed 18/8 stainless, fixed. Only the climbing-hold handle color changes.
- Standard colors MTNShade Blue `#2141A8` / Crimp Red `#C8102E`: **$12/mug**, no minimum, quantities in cartons of 36.
- Any other color = custom: **$13.50/mug**, quantities **300 → 324 → then +36** (360, 396…). Custom colors add +2 weeks.
- Samples: **$100** each (all colors), max 5. Production: 10–12 weeks after proof approval.
- Custom packaging: one-time $1/mug capped at $250.
- Recommended resale $25 (margin calculator).
- Contact email shown to customers: morrisonbibi17@gmail.com.
- **Prices are duplicated in `netlify/functions/checkout.js`** (the server is what Stripe charges). Change both together.

## Studio (`src/ui_kits/mug-customizer/index.html`)
Steps: Hold → Logo → Packaging → Order.
- `MugStudioApp.jsx` — app shell, state (saved to localStorage `mtnshade-customizer-v1`), presets, order submit, URL prefill, Stripe return handling.
- `MugStage.jsx` — three.js mug render. Logo at 47% height, default 50% scale.
- `DesignSteps.jsx` — Hold + Logo steps, presets: "Your gym logo" (reuses the gym's uploaded logo, else blank), "Example: Las Rocas", "MTNShade Blue", "MTNShade Red".
- `PackagingStep.jsx` / `PackagingStage.jsx` — co-brand box ("Gym logo × MTNShade") composited on the real dieline (`assets/packaging/dieline-base.png`) or "Custom" box contact form. Empty fields show "Enter brand name" / "Enter website" / "@Social Media Handle". Las Rocas text only appears with the Las Rocas preset.
- `OrderStep.jsx` — bulk lines (multi-color split), pricing, margin calc, timeline, samples, quote/checkout forms.
- `mc-proof.js` — printable proof page. `mc-orders.js` — Formspree submit, CRM save, Stripe checkout, UTM attribution.

### Prefilled outreach links
`/customize/?gym=Name&logo=<image url>&hold=<6-hex>&web=site.com&ig=handle&font=<key>&utm_source=…&utm_campaign=…`
Logo is fetched (falls back to images.weserv.nl proxy for CORS), applied once, then design params are stripped from the URL (utm/gym/name/email kept for attribution).

## Orders flow
1. Customer submits → Formspree (`https://formspree.io/f/xqpedoyo`, email notification backup) **and** `POST api/order` + `api/order-file` (CRM).
2. Checkout/sample → `api/checkout` creates a Stripe Checkout Session (client_reference_id = order id `MS-YYMMDD-XXXX`) → `api/payment` links session → Stripe redirect back with `?paid=…&session_id=…` → `api/payment` verifies with Stripe and stores ship-to/phone.
3. Quotes don't pay; they appear in the CRM as stage "Quote".

## CRM (`src/ui_kits/mug-customizer/crm.html`)
Password = env `CRM_PASSWORD` (sent as header `x-crm-key`). Files: `crm-data.js` (API client, demo data, customer roll-up), `CrmShell.jsx` (login, header, dashboard), `CrmOrders.jsx` (orders list, order detail, manufacturer packet, zip download, manual order), `CrmCustomers.jsx`.
- Order stages: Quote, Received, Proof sent, Proof approved, Sent to manufacturer, In production, Shipped, Delivered, Canceled.
- Customers are grouped per gym (`customer_key` = `gym-<slug>`, fallback email). Status auto: Lead → Sampled → Customer → Repeat (overridable). Location = Stripe ship-to, else Netlify IP geo (approx).
- Data: Netlify Blobs stores `mug-orders` (JSON per order), `mug-order-files` (`<id>/<field>` images: logo, lid_logo, mug, box, dieline + any CRM uploads), `mug-customers` (CRM notes/overrides).

## Backend (`netlify/functions/`, CommonJS, Netlify Functions v1 + `@netlify/blobs`)
- `checkout.js` → Stripe Checkout Session (prices recomputed server-side).
- `order.js` (public, create-once), `order-file.js` (public, images within 3h of order), `payment.js` (public, Stripe-verified).
- `crm.js` (private): ops `ping, list, file, update, customer, sync, upload, create`.
- `netlify/lib/crm.js` shared helpers. Routes are mapped in `netlify.toml` for both `/api/*` and `/customize/api/*`.

## Environment variables (Netlify → Site configuration → Environment variables)
- `STRIPE_SECRET_KEY` — test key `sk_test_…` until launch, then `sk_live_…`.
- `CRM_PASSWORD` — CRM login.
- `PUBLIC_URL` (optional) — e.g. `https://mtnshade.com/customize`.

## Open items
- Confirm Amazon ASINs: B0CK2W7TL8 = Blue?, B0CK2RZZPX = Red? (`mc-config.js` → `amazon`).
- Real box dimensions in inches (currently estimated).
- Optional: Stripe webhook for payments when a buyer closes the tab before returning (today the CRM re-checks unpaid orders with a session on every load, and has a "Check Stripe" button).
- Optional: precompile JSX (Babel in the browser is slower on first load).

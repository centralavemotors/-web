# Central Ave Motors

Phase 1 website for Central Ave Motors, 1980 Central Park Ave, Yonkers, NY 10710. Next.js App Router, TypeScript, Tailwind, and static inventory pages.

The public phone number is `(914) 222-0156`. It lives in `lib/site.ts` and is the only place to change it. Header, footer, the sticky mobile bar, `tel:` and `sms:` links, and the AutoDealer JSON-LD all read that value.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on port **43123**.

```bash
npm test
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local`. The site runs with none of them set.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://www.centralavemotors.com`. |
| `ROBOTS_INDEX` | `true` allows indexing. Any other value noindexes the site. Feeds stay allowed. Rebuild after changing it. |
| `INVENTORY_SOURCE` | `seed` (default) or `autofunds`. |
| `AUTOFUNDS_FEED_URL` | Reserved. The AutoFunds parser is not implemented. |
| `RESEND_API_KEY` | Sends ADF leads. If missing, the XML is logged and the form still returns success. |
| `LEAD_FROM_EMAIL` | From address for Resend. Required together with the API key. |
| `LEAD_TO_EMAIL` | Overrides the default DealerSocket inbox. |
| `LEAD_BACKUP_EMAIL` | BCC copy of each lead. |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager. Loaded only after consent. |
| `NEXT_PUBLIC_GA4_ID` | Standalone GA4. Skipped when a GTM ID is set. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel. Loaded only after consent. |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity. Loaded only after consent. Form fields are masked. |
| `META_PIXEL_ID` | Server pixel ID for the Conversions API. Falls back to the public pixel ID. |
| `META_CAPI_ACCESS_TOKEN` | Server event on a successful lead. Failures are swallowed. |
| `META_CAPI_TEST_EVENT_CODE` | Optional Meta test code. |
| `GOOGLE_STORE_CODE` | Google Vehicle Ads store code and Meta dealer id. Defaults to `CAM-YONKERS`. |

Phone, hours, hero media, logo, and the pricing disclaimer are code config in `lib/site.ts`, not environment variables. Hours are placeholders (`businessHours.confirmed` is `false`) and are omitted from schema.org until they are confirmed.

## Inventory

`InventorySource` in `lib/inventory/types.ts` is the only way pages read cars. `getInventory()` in `lib/inventory/index.ts` picks the source from `INVENTORY_SOURCE`.

The seed is `data/inventory.seed.json`. Prices and miles are numbers. Body style is derived when the feed leaves it blank, and the vehicle page says so. The slug is `{year}-{make}-{model}-{vin}`.

To use a live AutoFunds feed later:

1. Confirm whether the feed is XML or CSV and how often it updates.
2. Implement `load()` in `lib/inventory/autofunds-source.ts`. Fetch with `next: { revalidate: 3600 }` and map each row through `normalizeVehicle`.
3. Set `INVENTORY_SOURCE=autofunds` and `AUTOFUNDS_FEED_URL`.

Vehicle and inventory pages revalidate every hour.

## Leads

`POST /api/leads` builds an ADF/XML lead (vehicle VIN and stock when the form is about a car, customer, lead type, UTM, page URL) and emails it. The default inbox is `webleads@yonkersautogallery.dsmessage.com`, set in `lib/leads/destination.ts`. That address is server-only and is not shown on the site.

Without `RESEND_API_KEY` and `LEAD_FROM_EMAIL`, the route logs the ADF and returns success. A honeypot field returns success without sending. Each IP is limited to 5 submissions per 10 minutes. A configured Resend failure returns 502.

“Reserve this car” is a lead form. No payment processor is wired up.

## Feeds and SEO

- Google Vehicle Ads: `/feeds/google-vehicle-ads.xml`
- Meta automotive catalog: `/feeds/meta-automotive.xml`
- `app/sitemap.ts` lists static pages and every vehicle.
- `app/robots.ts` disallows `/` until `ROBOTS_INDEX=true`.

`redirects/cutover.map.json` maps current AutoFunds vehicle URLs to the new slugs. `middleware.ts` returns 301 for an exact path match. Rebuild the map with `npm run redirects` after the seed changes.

## Deploy on Vercel

Import the repository. Framework preset is Next.js. Set the environment variables above. Leave `ROBOTS_INDEX` unset until launch. `images.autofunds.net` is already allowed in `next.config.ts`.

## Design notes

The page is dark. Inventory photos stay on a white mat at their native size (`object-contain`), because AutoFunds studio shots are about 800–900px wide. The home hero is typographic. Set `heroMedia` in `lib/site.ts` when a brand still or film is ready. Do not point it at an inventory photo.

The pricing disclaimer is `PRICING_DISCLAIMER` in `lib/site.ts`. `dealerFee` (650) is the only fee amount. The short line sits next to prices. The full line, marked pending compliance review, is in the footer and on `/legal`.

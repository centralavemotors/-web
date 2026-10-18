/**
 * Public site configuration. Phone, hours, hero media, logo, and the pricing
 * disclaimer are edited here and nowhere else.
 *
 * Do not put lead inboxes or analytics secrets in this file. It is imported
 * by client components.
 */

export const siteName = "Central Ave Motors";

export const phone = {
  display: "(914) 222-0156",
  e164: "+19142220156",
} as const;

export function telHref() {
  return `tel:${phone.e164}`;
}

export function smsHref(
  body = "Hello, I'm interested in a vehicle at Central Ave Motors.",
) {
  return `sms:${phone.e164}?body=${encodeURIComponent(body)}`;
}

export function phoneNationalDigits() {
  const digits = phone.e164.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export const address = {
  street: "1980 Central Park Ave",
  city: "Yonkers",
  region: "NY",
  postalCode: "10710",
  country: "US",
  /** OpenStreetMap house interpolation for the showroom. Confirm before relying on it in ads. */
  latitude: 40.9645541,
  longitude: -73.8391677,
} as const;

export function formatAddress(style: "one-line" | "city-line" = "one-line") {
  const cityLine = `${address.city}, ${address.region} ${address.postalCode}`;
  if (style === "city-line") return cityLine;
  return `${address.street}, ${cityLine}`;
}

export function mapEmbedSrc() {
  return `https://maps.google.com/maps?q=${encodeURIComponent(formatAddress())}&z=15&output=embed`;
}

export function directionsHref() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress())}`;
}

/**
 * Hours are placeholders until the dealership confirms them.
 * `confirmed` must stay false until that happens. Schema.org hours are omitted
 * while this flag is false so we do not publish unconfirmed hours to Google.
 */
export const businessHours = {
  confirmed: false,
  summary: "Placeholder hours — not yet confirmed by the dealership.",
  entries: [
    { days: "Monday – Friday", time: "9:00 a.m. – 7:00 p.m." },
    { days: "Saturday", time: "9:00 a.m. – 6:00 p.m." },
    { days: "Sunday", time: "11:00 a.m. – 5:00 p.m." },
  ],
} as const;

/**
 * Swap in a brand film or photograph supplied by the dealership.
 * Leave null for the typographic hero. Do not point this at an inventory photo.
 */
export type HeroMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string }
  | null;

export const heroMedia: HeroMedia = null;

/** Set `src` when a logo file is available. Null uses the wordmark. */
export const logo: { src: string | null; alt: string } = {
  src: null,
  alt: "Central Ave Motors",
};

/**
 * The only pricing disclaimer. Vehicle prices, the footer, and the legal page
 * all read this object. Compliance edits belong here.
 */
export const PRICING_DISCLAIMER = {
  short:
    "Advertised price includes dealer charges except tax, title, and registration or DMV fees.",
  full: "New York requires advertised vehicle prices to include all charges imposed by the dealer, except taxes and registration, title, plate, and other DMV fees. The price shown for each vehicle is that advertised price. Dealer charges are included in the price shown; this site does not list a separate dealer fee on top of it. Taxes, title, registration, and DMV fees are extra and depend on where the vehicle will be registered. Any charge that is not already included will be disclosed before you agree to buy. The payment estimator uses only the price, down payment, term, and annual percentage rate you enter. It is an illustration, not a credit offer, an approval, or a promised rate. Inventory and availability can change. Confirm with the dealership that a vehicle is still for sale before you travel or send funds. This disclosure is a working draft for the dealership's compliance contact to review before launch.",
} as const;

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://www.centralavemotors.com";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

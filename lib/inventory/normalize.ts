import { parseLooseNumber, vehicleTitle } from "../format";
import { resolveBodyStyle } from "./body-style";
import { vehicleSlug } from "./slug";
import type { RawVehicle, Vehicle, VehiclePhoto } from "./types";

function cleanText(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}

function legacyPath(url: string | null | undefined) {
  if (!url) return null;
  try {
    return decodeURIComponent(new URL(url).pathname);
  } catch {
    return null;
  }
}

function photosFrom(raw: RawVehicle, alt: string): VehiclePhoto[] {
  const urls: string[] = [];
  const push = (value: string | null | undefined) => {
    const src = value?.trim();
    if (!src || urls.includes(src)) return;
    urls.push(src);
  };
  push(raw.img);
  if (Array.isArray(raw.images)) {
    for (const image of raw.images) push(image);
  }
  return urls.map((src, index) => ({
    src,
    alt: urls.length > 1 ? `${alt}, photo ${index + 1}` : alt,
  }));
}

export function normalizeVehicle(raw: RawVehicle): Vehicle | null {
  const vin = raw.vin?.trim().toUpperCase() ?? "";
  if (!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(vin)) return null;

  const year = parseLooseNumber(raw.year);
  if (year == null || year < 1981 || year > 2035) return null;

  const make = cleanText(raw.make);
  const model = cleanText(raw.model);
  if (!make || !model) return null;

  const price = parseLooseNumber(raw.price);
  const miles = parseLooseNumber(raw.miles);
  if (price == null || price <= 0 || miles == null || miles < 0) return null;

  const trim = cleanText(raw.trim);
  const color = cleanText(raw.color);
  const body = resolveBodyStyle({ body: raw.body, make, model, trim });
  const yearInt = Math.round(year);
  const draft = {
    year: yearInt,
    make,
    model,
    vin,
  };

  return {
    ...draft,
    trim,
    miles: Math.round(miles),
    price: Math.round(price),
    body: body.body,
    bodyDerived: body.derived,
    color,
    photos: photosFrom(raw, color ? `${vehicleTitle(draft)}, ${color}` : vehicleTitle(draft)),
    slug: vehicleSlug(draft),
    legacyPath: legacyPath(raw.url),
    stock: cleanText(raw.stock),
  };
}

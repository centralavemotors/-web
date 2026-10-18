import { randomUUID } from "node:crypto";
import { phoneNationalDigits, siteName, siteUrl } from "../site";
import { buildAdfLead, type AdfInterest, type AdfVehicle } from "./adf";
import { LEAD_INTENTS, LEAD_LABELS, type LeadIntent } from "./intents";

export type LeadDelivery = {
  eventId: string;
  subject: string;
  xml: string;
  intent: LeadIntent;
  vin?: string;
  email?: string;
  phone?: string;
  pageUrl?: string;
  price?: number;
};

export type LeadDecision = {
  httpStatus: number;
  body: { ok: true; id?: string } | { ok: false; errors: string[] };
  deliver?: LeadDelivery;
};

type Ctx = {
  now: Date;
  ip: string;
  originOk: boolean;
  allow: (ip: string, now: Date) => boolean;
  id?: string;
};

const INTEREST: Record<LeadIntent, AdfInterest> = {
  contact: "buy",
  test_drive: "test-drive",
  check_availability: "buy",
  trade_in: "buy",
  reserve: "buy",
  shipping_quote: "buy",
  financing: "buy",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.slice(0, max);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}

function safePageUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString().slice(0, 500);
  } catch {
    return undefined;
  }
}

function vehicleOfInterest(input: Record<string, unknown>): AdfVehicle | null {
  const vin = clean(input.vin, 17)?.toUpperCase();
  const year = clean(input.year, 4);
  const make = clean(input.make, 40);
  const model = clean(input.model, 40);
  if (!vin && !(make && model)) return null;
  const price = clean(input.price, 12)?.replace(/[^0-9.]/g, "");
  return {
    interest: "buy",
    status: "used",
    year,
    make,
    model,
    trim: clean(input.trim, 80),
    vin,
    stock: clean(input.stock, 32),
    odometer: clean(input.odometer, 12)?.replace(/[^0-9]/g, ""),
    price: price || undefined,
    exteriorColor: clean(input.exteriorColor, 80),
  };
}

export function decideLead(input: unknown, ctx: Ctx): LeadDecision {
  if (!ctx.originOk) {
    return { httpStatus: 403, body: { ok: false, errors: ["This submission was rejected."] } };
  }
  if (!ctx.allow(ctx.ip, ctx.now)) {
    return {
      httpStatus: 429,
      body: { ok: false, errors: ["Too many requests. Please call the dealership or try again shortly."] },
    };
  }
  if (!isRecord(input)) {
    return { httpStatus: 400, body: { ok: false, errors: ["We could not read that submission."] } };
  }
  if (clean(input.company_url, 200)) {
    return { httpStatus: 200, body: { ok: true } };
  }

  const intent = clean(input.intent, 40);
  if (!intent || !LEAD_INTENTS.includes(intent as LeadIntent)) {
    return { httpStatus: 400, body: { ok: false, errors: ["Choose a valid request type."] } };
  }
  const leadIntent = intent as LeadIntent;
  const errors: string[] = [];
  const name = clean(input.name, 120);
  if (!name || name.length < 2) errors.push("Enter your name.");
  const email = clean(input.email, 120);
  const phone = clean(input.phone, 30);
  if (email && !validEmail(email)) errors.push("Enter a valid email address.");
  if (phone && digits(phone).length < 10) errors.push("Enter a phone number with at least 10 digits.");
  if (!email && !phone) errors.push("Enter an email address or a phone number.");

  const message = clean(input.message, 2000);
  const preferredDate = clean(input.preferredDate, 40);
  const shippingState = clean(input.shippingState, 2)?.toUpperCase();
  const postalCode = clean(input.postalCode, 10);
  const tradeYear = clean(input.tradeYear, 4);
  const tradeMake = clean(input.tradeMake, 40);
  const tradeModel = clean(input.tradeModel, 40);
  const tradeMiles = clean(input.tradeMiles, 12)?.replace(/[^0-9]/g, "");
  const tradeVin = clean(input.tradeVin, 17)?.toUpperCase();

  const needsVehicle = leadIntent === "check_availability" || leadIntent === "test_drive" || leadIntent === "reserve";
  const interest = vehicleOfInterest(input);
  if (needsVehicle && !interest?.vin) errors.push("Choose a vehicle.");

  if (leadIntent === "trade_in") {
    if (!tradeYear || !/^\d{4}$/.test(tradeYear)) errors.push("Enter the year of the vehicle you want to trade.");
    if (!tradeMake) errors.push("Enter the make you want to trade.");
    if (!tradeModel) errors.push("Enter the model you want to trade.");
    if (!tradeMiles) errors.push("Enter the mileage of the vehicle you want to trade.");
  }
  if (leadIntent === "shipping_quote") {
    if (!shippingState || !/^[A-Z]{2}$/.test(shippingState)) {
      errors.push("Enter the two-letter state where the car should be shipped.");
    }
    if (!postalCode || !/^\d{5}(-\d{4})?$/.test(postalCode)) {
      errors.push("Enter a ZIP code for the shipping quote.");
    }
  }
  if (errors.length > 0 || !name) {
    return { httpStatus: 400, body: { ok: false, errors } };
  }

  const vehicles: AdfVehicle[] = [];
  if (leadIntent === "trade_in") {
    vehicles.push({
      interest: "trade-in",
      status: "used",
      year: tradeYear,
      make: tradeMake,
      model: tradeModel,
      vin: tradeVin,
      odometer: tradeMiles,
    });
  }
  if (interest && (leadIntent !== "trade_in" || interest.vin)) {
    vehicles.push({ ...interest, interest: INTEREST[leadIntent] });
  }

  const pageUrl = safePageUrl(clean(input.pageUrl, 500)) ?? siteUrl();
  const utm = {
    source: clean(input.utmSource, 120),
    medium: clean(input.utmMedium, 120),
    campaign: clean(input.utmCampaign, 120),
    term: clean(input.utmTerm, 120),
    content: clean(input.utmContent, 120),
  };
  const comments = [
    ["Lead type", leadIntent],
    ["Preferred date", preferredDate],
    ["Ship to state", shippingState],
    ["Postal code", postalCode],
    ["Message", message],
    ["Page", pageUrl],
    ["UTM source", utm.source],
    ["UTM medium", utm.medium],
    ["UTM campaign", utm.campaign],
    ["UTM term", utm.term],
    ["UTM content", utm.content],
  ]
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  const eventId = ctx.id ?? randomUUID();
  const title = interest?.year && interest.make && interest.model
    ? `${interest.year} ${interest.make} ${interest.model}`
    : undefined;
  const subject = title
    ? `[${siteName}] ${LEAD_LABELS[leadIntent]} — ${title}${interest?.vin ? ` (${interest.vin})` : ""}`
    : `[${siteName}] ${LEAD_LABELS[leadIntent]}`;
  const xml = buildAdfLead({
    id: eventId,
    date: ctx.now,
    pageUrl,
    customer: {
      fullName: name,
      email,
      phone,
      postalCode,
      region: shippingState,
      comments,
    },
    vehicles,
    vendorName: siteName,
    vendorPhone: phoneNationalDigits(),
  });
  const price = interest?.price ? Number(interest.price) : undefined;

  return {
    httpStatus: 200,
    body: { ok: true, id: eventId },
    deliver: {
      eventId,
      subject,
      xml,
      intent: leadIntent,
      vin: interest?.vin,
      email,
      phone,
      pageUrl,
      price: price && Number.isFinite(price) ? price : undefined,
    },
  };
}

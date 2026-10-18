import type { BodyStyle } from "./types";

const SUV_MODELS = new Set([
  "q3",
  "sq8",
  "x3",
  "x3 m",
  "x4",
  "x4 m",
  "x5",
  "x5 m",
  "x6",
  "x6 m",
  "x7",
  "equinox",
  "tahoe",
  "trailblazer",
  "traverse",
  "durango",
  "bronco",
  "bronco sport",
  "explorer",
  "yukon",
  "pilot",
  "palisade",
  "qx60",
  "compass",
  "grand cherokee",
  "grand cherokee l",
  "wrangler",
  "defender",
  "discovery",
  "discovery sport",
  "range rover",
  "range rover sport",
  "range rover velar",
  "range rover evoque",
  "g-class",
  "glc",
  "gle",
  "gls",
  "glb",
  "gla",
  "rogue",
  "macan",
  "cayenne",
  "model x",
  "tiguan",
]);

const COUPE_MODELS = new Set([
  "911",
  "mustang",
  "challenger",
  "m4",
  "amg gt",
  "4 series",
]);

const SEDAN_MODELS = new Set([
  "3 series",
  "5 series",
  "m3",
  "m3 cs",
  "m5",
  "a6",
  "a7",
  "charger",
  "accord",
  "accord hybrid",
  "accord sedan",
  "civic",
  "civic si",
  "sonata",
  "c-class",
  "e-class",
  "s-class",
  "model s",
]);

const PROVIDED: Record<string, BodyStyle> = {
  sedan: "Sedan",
  coupe: "Coupe",
  suv: "SUV",
  crossover: "SUV",
  "sport utility": "SUV",
  "sports activity vehicle": "SUV",
  "sports activity coupe": "SUV",
  convertible: "Convertible",
  cabriolet: "Convertible",
  wagon: "Wagon",
  hatchback: "Hatchback",
  truck: "Truck",
  van: "Van",
  other: "Other",
};

function norm(value: string) {
  return value.trim().toLowerCase();
}

export function deriveBodyStyle(make: string, model: string, trim: string): BodyStyle {
  const modelKey = norm(model);
  const blob = `${norm(make)} ${modelKey} ${norm(trim)}`;

  if (/cabriolet|convertible|spyder|spider|roadster/.test(blob)) return "Convertible";
  if (SUV_MODELS.has(modelKey) || /\bsuv\b|sports activity/.test(blob)) return "SUV";
  if (/\bsierra\b|\bsilverado\b|\bram\b|\btundra\b|\btacoma\b|\bf-150\b|\bf-250\b|\branger\b|\bcolorado\b|\b1500\b|\b2500\b/.test(blob)) {
    return "Truck";
  }
  if (/gran coupe/.test(blob)) return "Sedan";
  if (COUPE_MODELS.has(modelKey) || /\bcoupe\b|\bcpe\b|fastback/.test(blob)) return "Coupe";
  if (SEDAN_MODELS.has(modelKey) || /\bsedan\b/.test(blob)) return "Sedan";
  if (/\bwagon\b|\bavant\b/.test(blob)) return "Wagon";
  if (/\bhatchback\b/.test(blob)) return "Hatchback";
  if (/\bvan\b|\bsprinter\b/.test(blob)) return "Van";
  return "Other";
}

export function resolveBodyStyle(input: {
  body?: string | null;
  make: string;
  model: string;
  trim?: string | null;
}): { body: BodyStyle; derived: boolean } {
  const given = input.body?.trim().toLowerCase() ?? "";
  if (given && given !== "null" && given !== "n/a" && given !== "unknown") {
    const mapped = PROVIDED[given];
    if (mapped) return { body: mapped, derived: false };
  }
  return {
    body: deriveBodyStyle(input.make, input.model, input.trim ?? ""),
    derived: true,
  };
}

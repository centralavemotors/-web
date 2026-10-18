import type { BodyStyle, Vehicle } from "./types";

export const PAGE_SIZE = 12;

export const SORT_KEYS = [
  "price-desc",
  "price-asc",
  "year-desc",
  "year-asc",
  "miles-asc",
  "miles-desc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "year-desc", label: "Year: newest" },
  { value: "year-asc", label: "Year: oldest" },
  { value: "miles-asc", label: "Mileage: low to high" },
  { value: "miles-desc", label: "Mileage: high to low" },
];

export const PRICE_STOPS = [15000, 25000, 35000, 50000, 75000, 100000, 125000];
export const MILEAGE_STOPS = [10000, 20000, 30000, 50000, 75000, 100000];

export type InventoryQuery = {
  make?: string;
  model?: string;
  body?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMiles?: number;
  q?: string;
  sort: SortKey;
  page: number;
};

export type Filterable = {
  make: string;
  model: string;
  body: string;
  year: number;
  price: number;
  miles: number;
  trim?: string | null;
  color?: string | null;
  vin?: string;
  haystack?: string;
};

export type InventoryIndexItem = {
  make: string;
  model: string;
  body: BodyStyle;
  year: number;
  price: number;
  miles: number;
  haystack: string;
};

type RawParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const text = raw?.trim();
  return text ? text : undefined;
}

function num(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function buildHaystack(item: Filterable) {
  const raw = [item.year, item.make, item.model, item.trim, item.color, item.vin, item.body]
    .filter((part) => part != null && String(part).trim() !== "")
    .join(" ")
    .toLowerCase();
  return `${raw} ${raw.replace(/[^a-z0-9]/g, "")}`;
}

export function toIndexItem(vehicle: Vehicle): InventoryIndexItem {
  return {
    make: vehicle.make,
    model: vehicle.model,
    body: vehicle.body,
    year: vehicle.year,
    price: vehicle.price,
    miles: vehicle.miles,
    haystack: buildHaystack(vehicle),
  };
}

export function emptyQuery(): InventoryQuery {
  return { sort: "price-desc", page: 1 };
}

export function parseInventoryQuery(input: RawParams | URLSearchParams): InventoryQuery {
  const raw: RawParams =
    input instanceof URLSearchParams
      ? Object.fromEntries(input.entries())
      : input;
  const sortValue = one(raw.sort);
  const sort = SORT_KEYS.includes(sortValue as SortKey)
    ? (sortValue as SortKey)
    : "price-desc";
  const pageValue = num(one(raw.page));
  const page = pageValue && pageValue >= 1 ? Math.floor(pageValue) : 1;
  return {
    make: one(raw.make),
    model: one(raw.model),
    body: one(raw.body),
    minPrice: num(one(raw.minPrice)),
    maxPrice: num(one(raw.maxPrice)),
    minYear: num(one(raw.minYear)),
    maxYear: num(one(raw.maxYear)),
    maxMiles: num(one(raw.maxMiles)),
    q: one(raw.q),
    sort,
    page,
  };
}

export function matches(item: Filterable, query: InventoryQuery) {
  if (query.make && item.make.toLowerCase() !== query.make.toLowerCase()) return false;
  if (query.model && item.model.toLowerCase() !== query.model.toLowerCase()) return false;
  if (query.body && item.body.toLowerCase() !== query.body.toLowerCase()) return false;
  if (query.minPrice != null && item.price < query.minPrice) return false;
  if (query.maxPrice != null && item.price > query.maxPrice) return false;
  if (query.minYear != null && item.year < query.minYear) return false;
  if (query.maxYear != null && item.year > query.maxYear) return false;
  if (query.maxMiles != null && item.miles > query.maxMiles) return false;
  if (query.q) {
    const hay = item.haystack ?? buildHaystack(item);
    const tokens = query.q.toLowerCase().split(/\s+/).filter(Boolean);
    const ok = tokens.every((token) => {
      const compact = token.replace(/[^a-z0-9]/g, "");
      return hay.includes(token) || (compact.length > 0 && hay.includes(compact));
    });
    if (!ok) return false;
  }
  return true;
}

function compareSort(a: Filterable, b: Filterable, sort: SortKey) {
  switch (sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "year-asc":
      return a.year - b.year;
    case "year-desc":
      return b.year - a.year;
    case "miles-asc":
      return a.miles - b.miles;
    case "miles-desc":
      return b.miles - a.miles;
  }
}

export function sortVehicles<T extends Filterable>(items: T[], sort: SortKey) {
  return [...items].sort((a, b) => {
    const diff = compareSort(a, b, sort);
    if (diff !== 0) return diff;
    return (a.vin ?? `${a.make}-${a.model}`).localeCompare(b.vin ?? `${b.make}-${b.model}`);
  });
}

export function applyInventoryQuery<T extends Filterable>(items: T[], query: InventoryQuery) {
  const filtered = sortVehicles(
    items.filter((item) => matches(item, query)),
    query.sort,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  return {
    total: filtered.length,
    page,
    pageCount,
    start: filtered.length === 0 ? 0 : start + 1,
    end: Math.min(start + PAGE_SIZE, filtered.length),
    items: filtered.slice(start, start + PAGE_SIZE),
  };
}

export function toParamRecord(
  query: InventoryQuery,
  options?: { includePage?: boolean; includeDefaultSort?: boolean },
) {
  const out: Record<string, string> = {};
  if (query.make) out.make = query.make;
  if (query.model) out.model = query.model;
  if (query.body) out.body = query.body;
  if (query.minPrice != null) out.minPrice = String(query.minPrice);
  if (query.maxPrice != null) out.maxPrice = String(query.maxPrice);
  if (query.minYear != null) out.minYear = String(query.minYear);
  if (query.maxYear != null) out.maxYear = String(query.maxYear);
  if (query.maxMiles != null) out.maxMiles = String(query.maxMiles);
  if (query.q) out.q = query.q;
  if (options?.includeDefaultSort || query.sort !== "price-desc") out.sort = query.sort;
  if (options?.includePage && query.page > 1) out.page = String(query.page);
  return out;
}

export function toInventorySearch(query: InventoryQuery) {
  const params = new URLSearchParams(toParamRecord(query, { includePage: true }));
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function inventoryHref(query: InventoryQuery, patch: Partial<InventoryQuery> = {}) {
  return `/inventory${toInventorySearch({ ...query, ...patch })}`;
}

export function filterSummary(query: InventoryQuery) {
  return hasFilters(query) || query.sort !== "price-desc" || query.page > 1;
}

export function hasFilters(query: InventoryQuery) {
  return Boolean(
    query.make ||
      query.model ||
      query.body ||
      query.minPrice != null ||
      query.maxPrice != null ||
      query.minYear != null ||
      query.maxYear != null ||
      query.maxMiles != null ||
      query.q,
  );
}

export function pageWindow(current: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = [1, count, current - 1, current, current + 1].filter(
    (page, index, all) => page >= 1 && page <= count && all.indexOf(page) === index,
  );
  pages.sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (const page of pages) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && page - prev > 1) out.push("gap");
    out.push(page);
  }
  return out;
}

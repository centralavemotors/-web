import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { InventoryControls, SortSelect } from "@/components/inventory-controls";
import { Pagination } from "@/components/pagination";
import { PriceNote } from "@/components/price-note";
import { VehicleCard } from "@/components/vehicle-card";
import { formatMiles, formatPrice, formatSnapshotDate } from "@/lib/format";
import { buildCatalog } from "@/lib/inventory/catalog";
import {
  applyInventoryQuery,
  filterSummary,
  hasFilters,
  inventoryHref,
  parseInventoryQuery,
  toIndexItem,
  toParamRecord,
  type InventoryQuery,
} from "@/lib/inventory/filter";
import { getInventory } from "@/lib/inventory";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Inventory",
  description: "Pre-owned luxury and performance cars at Central Ave Motors in Yonkers, NY.",
  alternates: { canonical: "/inventory" },
};

function chips(query: InventoryQuery) {
  const href = (patch: Partial<InventoryQuery>) => `${inventoryHref({ ...query, ...patch, page: 1 })}#results`;
  const items: { key: string; label: string; href: string }[] = [];
  if (query.q) items.push({ key: "q", label: `Search: ${query.q}`, href: href({ q: undefined }) });
  if (query.make) items.push({ key: "make", label: query.make, href: href({ make: undefined, model: undefined }) });
  if (query.model) items.push({ key: "model", label: query.model, href: href({ model: undefined }) });
  if (query.body) items.push({ key: "body", label: query.body, href: href({ body: undefined }) });
  if (query.minYear) items.push({ key: "minYear", label: `${query.minYear} and newer`, href: href({ minYear: undefined }) });
  if (query.maxYear) items.push({ key: "maxYear", label: `Through ${query.maxYear}`, href: href({ maxYear: undefined }) });
  if (query.minPrice != null) items.push({ key: "minPrice", label: `From ${formatPrice(query.minPrice)}`, href: href({ minPrice: undefined }) });
  if (query.maxPrice != null) items.push({ key: "maxPrice", label: `Up to ${formatPrice(query.maxPrice)}`, href: href({ maxPrice: undefined }) });
  if (query.maxMiles != null) items.push({ key: "maxMiles", label: `Up to ${formatMiles(query.maxMiles)}`, href: href({ maxMiles: undefined }) });
  return items;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseInventoryQuery(params);
  const snapshot = await getInventory();
  const catalog = buildCatalog(snapshot.vehicles);
  const result = applyInventoryQuery(snapshot.vehicles, query);
  const activeChips = chips(query);
  const formKey = JSON.stringify(toParamRecord(query, { includePage: true, includeDefaultSort: true }));

  return (
    <Container className="py-12 md:py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-[#c9c3b6]">Yonkers, New York</p>
      <h1 className="mt-3 font-display text-6xl tracking-tight md:text-7xl">Inventory</h1>
      <p className="mt-4 max-w-2xl text-[#c9c3b6]">
        {snapshot.vehicles.length} vehicles
        {snapshot.updatedAt ? ` · snapshot ${formatSnapshotDate(snapshot.updatedAt)}` : ""}. Call to confirm a car is still here.
      </p>
      <div className="mt-4 max-w-2xl">
        <PriceNote />
      </div>
      <div className="mt-10 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
        <InventoryControls
          key={formKey}
          query={query}
          catalog={catalog}
          index={snapshot.vehicles.map(toIndexItem)}
          total={result.total}
        />
        <div id="results">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#c9c3b6]">
              {result.total === 0 ? "No vehicles match" : `Showing ${result.start}–${result.end} of ${result.total}`}
            </p>
            <SortSelect key={`sort-${formKey}`} query={query} />
          </div>
          {activeChips.length > 0 || filterSummary(query) ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <li key={chip.key}>
                  <Link href={chip.href} className="inline-flex h-10 items-center border border-white/20 px-3 text-sm">
                    {chip.label} <span className="sr-only">Remove filter</span>
                    <span aria-hidden="true" className="ml-2">
                      ×
                    </span>
                  </Link>
                </li>
              ))}
              {hasFilters(query) || query.sort !== "price-desc" ? (
                <li>
                  <Link href="/inventory#results" className="inline-flex h-10 items-center px-2 text-sm underline underline-offset-4">
                    Clear all
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : null}
          {result.items.length === 0 ? (
            <p className="mt-10 max-w-md text-[#c9c3b6]">
              Nothing in the current inventory matches those filters. Clear them and look again, or call the showroom.
            </p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((vehicle) => (
                <li key={vehicle.vin}>
                  <VehicleCard vehicle={vehicle} sizes="(max-width: 640px) 92vw, (max-width: 1280px) 40vw, 320px" />
                </li>
              ))}
            </ul>
          )}
          <Pagination query={{ ...query, page: result.page }} page={result.page} pageCount={result.pageCount} />
        </div>
      </div>
    </Container>
  );
}

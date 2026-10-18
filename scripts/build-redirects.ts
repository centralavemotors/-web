import { readFileSync, writeFileSync } from "node:fs";
import { normalizeVehicle } from "../lib/inventory/normalize";
import type { RawVehicle } from "../lib/inventory/types";

const raw = JSON.parse(readFileSync("data/inventory.seed.json", "utf8")) as RawVehicle[];
const entries: { source: string; destination: string; permanent: true }[] = [];
const seen = new Set<string>();

for (const row of raw) {
  if (!row.url) continue;
  const vehicle = normalizeVehicle(row);
  if (!vehicle) continue;
  const url = new URL(row.url);
  const encoded = url.pathname;
  let decoded = encoded;
  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    decoded = encoded;
  }
  const destination = `/inventory/${vehicle.slug}`;
  for (const source of [decoded, encoded]) {
    if (seen.has(source)) continue;
    seen.add(source);
    entries.push({ source, destination, permanent: true });
  }
}

entries.sort((a, b) => a.source.localeCompare(b.source));
writeFileSync("redirects/cutover.map.json", `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Wrote ${entries.length} redirects`);

import type { Vehicle } from "./types";

/** Highest priced vehicles, with at most two from the same make, so the row is not one brand. */
export function selectFeatured(vehicles: Vehicle[], count = 5) {
  const sorted = [...vehicles]
    .filter((vehicle) => vehicle.photos.length > 0)
    .sort((a, b) => b.price - a.price || a.vin.localeCompare(b.vin));
  const picked: Vehicle[] = [];
  const perMake = new Map<string, number>();
  for (const vehicle of sorted) {
    const seen = perMake.get(vehicle.make) ?? 0;
    if (seen >= 2) continue;
    picked.push(vehicle);
    perMake.set(vehicle.make, seen + 1);
    if (picked.length === count) return picked;
  }
  for (const vehicle of sorted) {
    if (picked.length === count) break;
    if (!picked.some((item) => item.vin === vehicle.vin)) picked.push(vehicle);
  }
  return picked;
}

import type { BodyStyle, Vehicle } from "./types";

export type Catalog = {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  bodies: BodyStyle[];
  minYear: number;
  maxYear: number;
};

export function buildCatalog(vehicles: Vehicle[]): Catalog {
  const models = new Map<string, Set<string>>();
  const bodies = new Set<BodyStyle>();
  let minYear = Number.POSITIVE_INFINITY;
  let maxYear = Number.NEGATIVE_INFINITY;
  for (const vehicle of vehicles) {
    if (!models.has(vehicle.make)) models.set(vehicle.make, new Set());
    models.get(vehicle.make)?.add(vehicle.model);
    bodies.add(vehicle.body);
    minYear = Math.min(minYear, vehicle.year);
    maxYear = Math.max(maxYear, vehicle.year);
  }
  const makes = [...models.keys()].sort((a, b) => a.localeCompare(b));
  const modelsByMake: Record<string, string[]> = {};
  for (const make of makes) {
    modelsByMake[make] = [...(models.get(make) ?? [])].sort((a, b) => a.localeCompare(b));
  }
  return {
    makes,
    modelsByMake,
    bodies: [...bodies].sort((a, b) => a.localeCompare(b)),
    minYear: Number.isFinite(minYear) ? minYear : new Date().getFullYear(),
    maxYear: Number.isFinite(maxYear) ? maxYear : new Date().getFullYear(),
  };
}

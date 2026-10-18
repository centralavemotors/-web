import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeVehicle } from "./normalize";
import type { InventorySource, RawVehicle } from "./types";

export const seedInventorySource: InventorySource = {
  id: "seed",
  async load() {
    const file = path.join(process.cwd(), "data", "inventory.seed.json");
    const raw = JSON.parse(await readFile(file, "utf8")) as RawVehicle[];
    const vehicles = raw.flatMap((row) => {
      const vehicle = normalizeVehicle(row);
      return vehicle ? [vehicle] : [];
    });
    if (vehicles.length !== raw.length) {
      console.warn(
        `[inventory] Dropped ${raw.length - vehicles.length} seed row(s) that failed normalization.`,
      );
    }
    return {
      sourceId: "seed",
      updatedAt: "2026-10-18",
      vehicles,
    };
  },
};

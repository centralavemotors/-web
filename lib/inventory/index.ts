import "server-only";
import { cache } from "react";
import { autoFundsInventorySource } from "./autofunds-source";
import { seedInventorySource } from "./seed-source";
import type { InventorySource } from "./types";

export function getInventorySource(): InventorySource {
  const id = (process.env.INVENTORY_SOURCE ?? "seed").toLowerCase();
  if (id === "seed") return seedInventorySource;
  if (id === "autofunds") return autoFundsInventorySource;
  throw new Error(`Unknown INVENTORY_SOURCE "${id}". Expected "seed" or "autofunds".`);
}

export const getInventory = cache(async () => getInventorySource().load());

export const getVehicleBySlug = cache(async (slug: string) => {
  const snapshot = await getInventory();
  return snapshot.vehicles.find((vehicle) => vehicle.slug === slug) ?? null;
});

export const getVehicleByVin = cache(async (vin: string) => {
  const snapshot = await getInventory();
  const key = vin.trim().toUpperCase();
  return snapshot.vehicles.find((vehicle) => vehicle.vin === key) ?? null;
});

import type { Vehicle } from "./inventory/types";
import { headlinePrice } from "./site";

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMiles(miles: number) {
  return `${new Intl.NumberFormat("en-US").format(miles)} mi`;
}

export function formatSnapshotDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function vehicleTitle(vehicle: Pick<Vehicle, "year" | "make" | "model">) {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function vehicleSummary(vehicle: Vehicle) {
  const name = `${vehicleTitle(vehicle)}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
  const bits = [
    `${name}.`,
    `${formatMiles(vehicle.miles)}.`,
    vehicle.color ? `Exterior: ${vehicle.color}.` : null,
    `Pre-owned at Central Ave Motors in Yonkers, NY.`,
    `Advertised price ${formatPrice(headlinePrice(vehicle.price))}.`,
  ];
  return bits.filter(Boolean).join(" ");
}

export function parseLooseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value == null) return null;
  const cleaned = String(value).replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

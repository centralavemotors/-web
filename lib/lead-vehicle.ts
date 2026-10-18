import type { Vehicle } from "./inventory/types";
import { headlinePrice } from "./site";

export type LeadVehicle = {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim?: string;
  price?: string;
  exteriorColor?: string;
  odometer?: string;
  stock?: string;
};

export function leadVehicleFrom(vehicle: Vehicle): LeadVehicle {
  return {
    vin: vehicle.vin,
    year: String(vehicle.year),
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? undefined,
    price: String(headlinePrice(vehicle.price)),
    exteriorColor: vehicle.color ?? undefined,
    odometer: String(vehicle.miles),
    stock: vehicle.stock ?? undefined,
  };
}

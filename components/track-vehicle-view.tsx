"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { headlinePrice } from "@/lib/site";

export function TrackVehicleView({
  vehicle,
}: {
  vehicle: { vin: string; year: number; make: string; model: string; price: number; slug: string };
}) {
  useEffect(() => {
    track({
      name: "vehicle_view",
      payload: {
        vin: vehicle.vin,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        price: headlinePrice(vehicle.price),
        slug: vehicle.slug,
      },
    });
  }, [vehicle.vin, vehicle.year, vehicle.make, vehicle.model, vehicle.price, vehicle.slug]);
  return null;
}

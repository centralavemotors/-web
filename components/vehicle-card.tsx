import Image from "next/image";
import Link from "next/link";
import { formatMiles, formatPrice, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/inventory/types";

export function VehicleCard({
  vehicle,
  sizes = "(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 280px",
}: {
  vehicle: Vehicle;
  sizes?: string;
}) {
  const photo = vehicle.photos[0];
  const title = vehicleTitle(vehicle);
  return (
    <Link
      href={`/inventory/${vehicle.slug}`}
      className="group flex h-full flex-col bg-[#f3f2ee] text-[#1c1b18]"
    >
      <div className="bg-white p-3">
        {photo ? (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-contain"
              sizes={sizes}
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-sm text-[#4a463f]">Photo coming soon</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[#4a463f]">
          {vehicle.year} · {vehicle.make}
        </p>
        <h3 className="mt-2 font-display text-3xl leading-none tracking-tight">{vehicle.model}</h3>
        {vehicle.trim ? <p className="mt-2 line-clamp-2 text-sm text-[#4a463f]">{vehicle.trim}</p> : null}
        <p className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="font-display text-2xl leading-none">{formatPrice(vehicle.price)}</span>
          <span className="text-sm text-[#4a463f]">{formatMiles(vehicle.miles)}</span>
        </p>
        <span className="sr-only">View {title}</span>
      </div>
    </Link>
  );
}

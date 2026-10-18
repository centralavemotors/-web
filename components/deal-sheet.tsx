"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { track } from "@/lib/analytics";
import { formatMiles, formatPrice, vehicleTitle } from "@/lib/format";
import { leadVehicleFrom, type LeadVehicle } from "@/lib/lead-vehicle";
import type { Vehicle } from "@/lib/inventory/types";
import { LeadForm } from "./lead-form";
import { PhoneLink, TextLink } from "./phone-link";
import { PriceNote } from "./price-note";

function ActionDialog({
  label,
  title,
  description,
  intent,
  vehicle,
  submitLabel,
  variant = "default",
}: {
  label: string;
  title: string;
  description: string;
  intent: "check_availability" | "test_drive" | "reserve";
  vehicle: LeadVehicle;
  submitLabel: string;
  variant?: "default" | "outline";
}) {
  return (
    <Dialog>
      <DialogTrigger
        className={buttonVariants({ variant, className: "h-12 w-full" })}
        onClick={() => track({ name: "cta_click", payload: { cta: intent, vin: vehicle.vin, page: "vdp" } })}
      >
        {label}
      </DialogTrigger>
      <DialogContent className="paper-panel max-h-[85svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-10">
          <DialogTitle className="font-display text-3xl tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-base text-[#4a463f]">{description}</DialogDescription>
        </DialogHeader>
        <LeadForm intent={intent} vehicle={vehicle} submitLabel={submitLabel} />
      </DialogContent>
    </Dialog>
  );
}

export function DealSheet({ vehicle }: { vehicle: Vehicle }) {
  const ref = leadVehicleFrom(vehicle);
  const title = vehicleTitle(vehicle);
  return (
    <aside className="paper-panel h-fit p-4 sm:p-7 lg:sticky lg:top-24">
      <p className="text-xs uppercase tracking-[0.18em] text-[#4a463f]">
        {vehicle.year} · {vehicle.make}
      </p>
      <h1 className="mt-2 font-display text-5xl leading-[0.95] tracking-tight">{vehicle.model}</h1>
      {vehicle.trim ? <p className="mt-3 text-sm leading-relaxed text-[#4a463f]">{vehicle.trim}</p> : null}
      <p className="mt-4 font-display text-4xl tracking-tight sm:mt-6">{formatPrice(vehicle.price)}</p>
      <div className="mt-3">
        <PriceNote tone="paper" />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[#4a463f]">Mileage</dt>
          <dd>{formatMiles(vehicle.miles)}</dd>
        </div>
        <div>
          <dt className="text-[#4a463f]">Exterior</dt>
          <dd>{vehicle.color ?? "Not listed"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[#4a463f]">VIN</dt>
          <dd className="font-mono text-sm">{vehicle.vin}</dd>
        </div>
      </dl>
      <div className="mt-6 grid gap-3">
        <ActionDialog
          label="Check availability"
          title="Check availability"
          description={`Ask if the ${title} is still here. This does not hold the car.`}
          intent="check_availability"
          vehicle={ref}
          submitLabel="Check availability"
        />
        <ActionDialog
          label="Schedule a test drive"
          title="Schedule a test drive"
          description="Tell us a day that works. We will confirm whether the car is free."
          intent="test_drive"
          vehicle={ref}
          submitLabel="Request a test drive"
          variant="outline"
        />
        <Link
          href={`/financing?vin=${vehicle.vin}`}
          className={buttonVariants({ variant: "outline", className: "h-12 w-full" })}
          onClick={() => track({ name: "cta_click", payload: { cta: "pre_qualify", vin: vehicle.vin, page: "vdp" } })}
        >
          Get pre-qualified
        </Link>
        <a
          href="#payment"
          className={buttonVariants({ variant: "outline", className: "h-12 w-full" })}
          onClick={() => track({ name: "cta_click", payload: { cta: "estimate_payment", vin: vehicle.vin, page: "vdp" } })}
        >
          Estimate payment
        </a>
        <Link
          href={`/sell?vin=${vehicle.vin}`}
          className={buttonVariants({ variant: "outline", className: "h-12 w-full" })}
          onClick={() => track({ name: "cta_click", payload: { cta: "value_trade", vin: vehicle.vin, page: "vdp" } })}
        >
          Value my trade
        </Link>
        <ActionDialog
          label="Reserve this car"
          title="Request to reserve"
          description="This sends a request only. It does not charge a card and does not hold the car until the dealership confirms."
          intent="reserve"
          vehicle={ref}
          submitLabel="Send reserve request"
          variant="outline"
        />
        <div className="grid grid-cols-2 gap-3">
          <PhoneLink location="vdp" className={buttonVariants({ variant: "outline", className: "h-12" })}>
            Call
          </PhoneLink>
          <TextLink location="vdp" className={buttonVariants({ variant: "outline", className: "h-12" })}>
            Text
          </TextLink>
        </div>
      </div>
    </aside>
  );
}

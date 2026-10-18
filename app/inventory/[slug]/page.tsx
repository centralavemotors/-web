import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { DealSheet } from "@/components/deal-sheet";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { PaymentEstimator } from "@/components/payment-estimator";
import { TrackVehicleView } from "@/components/track-vehicle-view";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { formatMiles, vehicleSummary, vehicleTitle } from "@/lib/format";
import { getInventory, getVehicleBySlug } from "@/lib/inventory";
import { leadVehicleFrom } from "@/lib/lead-vehicle";
import { breadcrumbJsonLd, vehicleJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const snapshot = await getInventory();
  return snapshot.vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle not found" };
  const title = vehicleTitle(vehicle);
  const description = vehicleSummary(vehicle);
  const url = `/inventory/${vehicle.slug}`;
  const image = vehicle.photos[0];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: image ? [{ url: image.src, alt: image.alt }] : undefined,
    },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const title = vehicleTitle(vehicle);
  const pageUrl = absoluteUrl(`/inventory/${vehicle.slug}`);
  const specs = [
    ["Year", String(vehicle.year)],
    ["Make", vehicle.make],
    ["Model", vehicle.model],
    ["Trim", vehicle.trim ?? "Not listed"],
    ["Mileage", formatMiles(vehicle.miles)],
    ["Exterior", vehicle.color ?? "Not listed"],
    ["Body", vehicle.body],
    ["Condition", "Pre-owned"],
    ["VIN", vehicle.vin],
  ];

  return (
    <Container className="py-8 md:py-12">
      <TrackVehicleView vehicle={vehicle} />
      <JsonLd data={vehicleJsonLd(vehicle, pageUrl)} />
      <JsonLd data={breadcrumbJsonLd(vehicle, pageUrl)} />
      <nav aria-label="Breadcrumb" className="text-sm text-[#c9c3b6]">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="underline underline-offset-4">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/inventory" className="underline underline-offset-4">
              Inventory
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[#f6f4ef]">{title}</li>
        </ol>
      </nav>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <VehicleGallery photos={vehicle.photos} title={title} />
        <DealSheet vehicle={vehicle} />
      </div>
      <section className="mt-14">
        <h2 className="font-display text-4xl tracking-tight">Details</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[#c9c3b6]">{vehicleSummary(vehicle)}</p>
        {vehicle.bodyDerived ? (
          <p className="mt-3 max-w-3xl text-sm text-[#c9c3b6]">
            Body style is estimated from the model name because the inventory feed did not include one.
          </p>
        ) : null}
        <dl className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map(([label, value]) => (
            <div key={label} className="bg-[#0e0e0c] px-4 py-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-[#c9c3b6]">{label}</dt>
              <dd className={`mt-2 ${label === "VIN" ? "font-mono text-sm" : ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <PaymentEstimator price={vehicle.price} />
        <section id="shipping" className="border border-white/15 p-6 sm:p-8">
          <h2 className="font-display text-4xl tracking-tight">Shipping quote</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c9c3b6]">
            Buying from outside New York? Tell us where the car should go. We will follow up with transport options. We also handle out-of-state registration and temporary tags. This form does not show a shipping price.
          </p>
          <div className="paper-panel mt-6 p-5">
            <LeadForm intent="shipping_quote" vehicle={leadVehicleFrom(vehicle)} submitLabel="Request a shipping quote" />
          </div>
        </section>
      </div>
    </Container>
  );
}

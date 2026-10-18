import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { LeadForm } from "@/components/lead-form";
import { getVehicleByVin } from "@/lib/inventory";
import { leadVehicleFrom } from "@/lib/lead-vehicle";

export const metadata: Metadata = {
  title: "Sell or trade",
  description: "Tell Central Ave Motors about a vehicle you want to sell or trade. Offers are not instant.",
  alternates: { canonical: "/sell" },
};

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const vin = typeof params.vin === "string" ? params.vin : undefined;
  const vehicle = vin ? await getVehicleByVin(vin) : null;

  return (
    <>
      <PageHeader
        eyebrow="Sell / Trade"
        title="Tell us about your vehicle."
        lede="We buy cars and take trades. This form asks for the basics. A person from the dealership calls you with an offer. The site does not show an instant value, and photo upload is not available yet."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        {vehicle ? (
          <p className="mb-6 text-[#c9c3b6]">
            You were looking at the {vehicle.year} {vehicle.make} {vehicle.model}. Include it with your trade request if you want the offer considered against that car.
          </p>
        ) : null}
        <div className="paper-panel p-6 sm:p-8">
          <LeadForm
            intent="trade_in"
            vehicle={vehicle ? leadVehicleFrom(vehicle) : undefined}
            submitLabel="Request an offer"
          />
        </div>
      </Container>
    </>
  );
}

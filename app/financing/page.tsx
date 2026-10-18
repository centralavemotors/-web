import type { Metadata } from "next";
import { Container } from "@/components/container";
import { DraftNotice, PageHeader } from "@/components/page-header";
import { LeadForm } from "@/components/lead-form";
import { getVehicleByVin } from "@/lib/inventory";
import { leadVehicleFrom } from "@/lib/lead-vehicle";
import { phone } from "@/lib/site";

export const metadata: Metadata = {
  title: "Financing",
  description: "Ask Central Ave Motors about financing a pre-owned vehicle. This site does not quote rates or take a credit application.",
  alternates: { canonical: "/financing" },
};

export default async function FinancingPage({
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
        eyebrow="Financing"
        title="A callback, not a rate quote."
        lede="Financing is arranged with lending partners. This website does not take a credit application, pull credit, or publish an annual percentage rate."
      />
      <Container className="grid gap-10 py-12 md:grid-cols-[1fr_minmax(0,28rem)] md:py-16">
        <div className="grid gap-6 text-[#c9c3b6]">
          <DraftNotice>
            The online credit application is not connected. Use the form and the dealership will follow up. Do not send a Social Security number or account numbers.
          </DraftNotice>
          <p>You can pay with your own financing, or ask us to start an application with a lending partner. A specialist will tell you what is needed.</p>
          <p>Any payment figure on a vehicle page is an estimate you calculate with your own rate. It is not an offer of credit.</p>
          <p>Questions now: call {phone.display}.</p>
        </div>
        <div className="paper-panel p-6">
          <h2 className="font-display text-3xl tracking-tight">Request a callback</h2>
          {vehicle ? (
            <p className="mt-2 text-sm text-[#4a463f]">
              About the {vehicle.year} {vehicle.make} {vehicle.model}.
            </p>
          ) : null}
          <div className="mt-5">
            <LeadForm
              intent="financing"
              vehicle={vehicle ? leadVehicleFrom(vehicle) : undefined}
              submitLabel="Request a callback"
            />
          </div>
        </div>
      </Container>
    </>
  );
}

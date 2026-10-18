import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { DraftNotice, PageHeader } from "@/components/page-header";
import { phone } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Draft terms for the Central Ave Motors website.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms" lede="Placeholder terms. Have counsel review them before launch." />
      <Container className="max-w-3xl space-y-6 py-12 leading-relaxed text-[#c9c3b6] md:py-16">
        <DraftNotice>This terms page is placeholder text. It is not a contract.</DraftNotice>
        <p>
          The site lists pre-owned vehicles offered by Central Ave Motors in Yonkers, NY. A vehicle can sell before the page is updated. Call {phone.display} to confirm it is still available.
        </p>
        <p>
          Advertised prices follow the{" "}
          <Link href="/legal#pricing" className="underline underline-offset-4">
            pricing disclosure
          </Link>
          . Payment figures are estimates based on numbers you enter. They are not credit offers.
        </p>
        <p>
          A reserve request, test-drive request, or shipping quote is a message to the dealership. It does not charge a card, create a deposit, or hold a car by itself.
        </p>
        <p>Photos are provided by the inventory feed and may show the vehicle on a studio background.</p>
      </Container>
    </>
  );
}

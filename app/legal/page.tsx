import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { DraftNotice, PageHeader } from "@/components/page-header";
import { PRICING_DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing disclosure",
  description: "How Central Ave Motors shows advertised vehicle prices.",
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Pricing disclosure"
        lede="This is the same disclosure shown near prices and in the footer. It is the only copy, so a compliance edit updates every page."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <DraftNotice>
          Working draft for the dealership compliance contact. It is not a finished legal opinion.
        </DraftNotice>
        <section id="pricing" className="mt-8">
          <h2 className="font-display text-3xl">Advertised price</h2>
          <p className="mt-4 leading-relaxed text-[#c9c3b6]">{PRICING_DISCLAIMER.full}</p>
          <p className="mt-4 text-sm text-[#c9c3b6]">{PRICING_DISCLAIMER.short}</p>
        </section>
        <ul className="mt-10 grid gap-2 text-sm">
          <li>
            <Link className="underline underline-offset-4" href="/privacy">
              Privacy draft
            </Link>
          </li>
          <li>
            <Link className="underline underline-offset-4" href="/terms">
              Terms draft
            </Link>
          </li>
          <li>
            <Link className="underline underline-offset-4" href="/accessibility">
              Accessibility draft
            </Link>
          </li>
        </ul>
      </Container>
    </>
  );
}

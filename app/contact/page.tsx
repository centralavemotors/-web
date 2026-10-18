import type { Metadata } from "next";
import { Container } from "@/components/container";
import { HoursList } from "@/components/hours-list";
import { LeadForm } from "@/components/lead-form";
import { PageHeader } from "@/components/page-header";
import { PhoneLink, TextLink } from "@/components/phone-link";
import { directionsHref, formatAddress, mapEmbedSrc } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit or call Central Ave Motors at 1980 Central Park Ave, Yonkers, NY 10710.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Come by, or send a note."
        lede="The showroom is on Central Park Avenue in Yonkers. Call, text, or use the form and someone at the dealership will reply."
      />
      <Container className="grid gap-12 py-12 md:grid-cols-2 md:py-16">
        <div>
          <p className="font-display text-4xl leading-snug">{formatAddress()}</p>
          <p className="mt-4 flex flex-wrap gap-4">
            <PhoneLink location="contact" className="underline underline-offset-4" />
            <TextLink location="contact" className="underline underline-offset-4">
              Text the showroom
            </TextLink>
          </p>
          <div className="mt-6 max-w-sm text-[#c9c3b6]">
            <HoursList />
          </div>
          <p className="mt-6">
            <a href={directionsHref()} className="text-sm underline underline-offset-4">
              Open directions
            </a>
          </p>
          <div id="map" className="mt-8 bg-white ring-1 ring-white/15">
            <iframe
              title="Map showing Central Ave Motors at 1980 Central Park Ave, Yonkers, NY"
              src={mapEmbedSrc()}
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="paper-panel h-fit p-6 sm:p-8">
          <h2 className="font-display text-3xl tracking-tight">Send a message</h2>
          <div className="mt-5">
            <LeadForm intent="contact" submitLabel="Send message" />
          </div>
        </div>
      </Container>
    </>
  );
}

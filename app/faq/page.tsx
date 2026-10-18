import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { HoursList } from "@/components/hours-list";
import { PageHeader } from "@/components/page-header";
import { formatAddress, phone } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Shipping, paperwork, pricing, financing, and trades at Central Ave Motors in Yonkers.",
  alternates: { canonical: "/faq" },
};

const QUESTIONS: { q: string; a: ReactNode }[] = [
  {
    q: "Can I buy from another state?",
    a: "Yes. We prepare the paperwork remotely and handle out-of-state registration and temporary tags. Ask for a shipping quote on the vehicle page and we will tell you the transport cost before you commit.",
  },
  {
    q: "Do you ship the car?",
    a: "Yes. We arrange transport. The cost depends on distance and the carrier, so we quote it instead of publishing a flat fee.",
  },
  {
    q: "What is included in the advertised price?",
    a: (
      <>
        Dealer charges are included. Tax, title, and registration or DMV fees are not. Read the{" "}
        <Link href="/legal#pricing" className="underline underline-offset-4">
          pricing disclosure
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I finance a purchase?",
    a: "Financing is available through lending partners. This site does not take a credit application and does not quote rates. Send a request on the financing page and a specialist will follow up.",
  },
  {
    q: "Do you take trades?",
    a: "Yes. Tell us about your vehicle on the Sell / Trade page. We will call with an offer. The site does not show an instant value.",
  },
  {
    q: "How do I reserve a car?",
    a: "Use Reserve this car on the vehicle page. That sends a request. It does not charge a card and does not hold the car until the dealership confirms.",
  },
  {
    q: "Can I schedule a test drive?",
    a: "Yes, from the vehicle page. We will confirm a time. Requesting a test drive does not hold the car.",
  },
  {
    q: "What warranty comes with the car?",
    a: "Placeholder answer: the inventory feed does not include warranty terms. Ask about a specific car and we will tell you what, if anything, applies. This answer is not final.",
  },
  {
    q: "Do you inspect every car?",
    a: "Placeholder answer: ask the dealership what inspection a specific car received. This site does not describe an inspection standard because one has not been confirmed for publication.",
  },
  {
    q: "Where are you, and when are you open?",
    a: (
      <span>
        {formatAddress()}. Call {phone.display}. Hours below are placeholders until the dealership confirms them.
        <span className="mt-3 block text-[#c9c3b6]">
          <HoursList />
        </span>
      </span>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Straight answers."
        lede="A few things buyers ask before they call. Items marked as placeholders are waiting on the dealership."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <div className="divide-y divide-white/10 border-y border-white/10">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-[#c9c3b6] group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="pb-5 leading-relaxed text-[#c9c3b6]">{item.a}</div>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}

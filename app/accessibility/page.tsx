import type { Metadata } from "next";
import { Container } from "@/components/container";
import { DraftNotice, PageHeader } from "@/components/page-header";
import { phone } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Draft accessibility statement for Central Ave Motors.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Accessibility"
        lede="We aim for WCAG 2.1 AA: text contrast, keyboard access, form labels, and alt text on vehicle photos."
      />
      <Container className="max-w-3xl space-y-6 py-12 leading-relaxed text-[#c9c3b6] md:py-16">
        <DraftNotice>This accessibility statement is a placeholder pending a full review before launch.</DraftNotice>
        <p>
          Pages are built to work with a keyboard and at phone width. If a control is hard to use, call {phone.display} and we will help you with that vehicle by phone.
        </p>
        <p>
          Known limits in this version: the map is a third-party embed, business hours on the site are placeholders, and each vehicle photo is a single studio image unless the feed sends more.
        </p>
      </Container>
    </>
  );
}

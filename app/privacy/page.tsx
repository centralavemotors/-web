import type { Metadata } from "next";
import { Container } from "@/components/container";
import { DraftNotice, PageHeader } from "@/components/page-header";
import { phone } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Draft privacy notice for Central Ave Motors.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy" lede="Placeholder notice. Have counsel review it before launch." />
      <Container className="max-w-3xl space-y-6 py-12 leading-relaxed text-[#c9c3b6] md:py-16">
        <DraftNotice>This privacy page is placeholder text. It is not a final policy.</DraftNotice>
        <p>
          Central Ave Motors, 1980 Central Park Ave, Yonkers, NY 10710, operates this website. Phone {phone.display}.
        </p>
        <p>
          Forms collect your name and the email or phone number you choose to give us, plus the vehicle you were viewing and any message you write. We email that request to the dealership so someone can reply. Do not put a Social Security number, a driver license number, or payment card numbers in a form. This site does not take credit applications or card payments.
        </p>
        <p>
          If you accept analytics cookies, the site may load Google Tag Manager, Google Analytics, a Meta pixel, or Microsoft Clarity, and only when those services have been configured. Session recordings are set to mask form fields. If you decline, those tags are not loaded.
        </p>
        <p>
          Vehicle pages are public. Inventory data comes from the dealership feed. We do not sell the contents of a form from this website.
        </p>
        <p>To ask about information you sent through a form, call {phone.display}.</p>
      </Container>
    </>
  );
}

import Link from "next/link";
import { PRICING_DISCLAIMER, formatAddress } from "@/lib/site";
import { Container } from "./container";
import { HoursList } from "./hours-list";
import { PhoneLink } from "./phone-link";
import { Wordmark } from "./wordmark";

const groups = [
  {
    title: "Shop",
    links: [
      ["/inventory", "Inventory"],
      ["/financing", "Financing"],
      ["/sell", "Sell / Trade"],
    ],
  },
  {
    title: "Visit",
    links: [
      ["/contact", "Contact"],
      ["/faq", "FAQ"],
      ["/contact#map", "Map"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/legal#pricing", "Pricing disclosure"],
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/accessibility", "Accessibility"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 pt-16 pb-8">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#c9c3b6]">{formatAddress()}</p>
            <PhoneLink location="footer" className="mt-3 inline-block text-sm underline underline-offset-4" />
            <div className="mt-6 max-w-xs text-[#c9c3b6]">
              <HoursList />
            </div>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#c9c3b6]">{group.title}</p>
              <ul className="mt-4 grid gap-2">
                {group.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm underline-offset-4 hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-14 border-t border-white/10 pt-6">
          <p className="max-w-4xl text-sm leading-relaxed text-[#c9c3b6]">{PRICING_DISCLAIMER.full}</p>
          <p className="mt-6 text-sm text-[#c9c3b6]">© {new Date().getFullYear()} Central Ave Motors</p>
        </div>
      </Container>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import { HoursList } from "@/components/hours-list";
import { PhoneLink } from "@/components/phone-link";
import { PriceNote } from "@/components/price-note";
import { QuickSearch } from "@/components/quick-search";
import { VehicleCard } from "@/components/vehicle-card";
import { formatMiles, formatPrice, vehicleTitle } from "@/lib/format";
import { buildCatalog } from "@/lib/inventory/catalog";
import { selectFeatured } from "@/lib/inventory/featured";
import { getInventory } from "@/lib/inventory";
import { directionsHref, formatAddress, heroMedia, mapEmbedSrc } from "@/lib/site";

export const revalidate = 3600;

const STEPS = [
  {
    number: "01",
    title: "Nationwide shipping",
    body: "Request a quote on the vehicle page. We arrange transport and tell you the cost before you commit. The price depends on distance and the carrier.",
  },
  {
    number: "02",
    title: "Remote paperwork",
    body: "We prepare the documents with you and handle out-of-state registration and temporary tags, so the purchase does not require a trip to a New York DMV.",
  },
  {
    number: "03",
    title: "Financing",
    body: "Ask us to start a credit application. The online application is not connected on this site yet, so a specialist follows up. We do not publish rates here.",
  },
  {
    number: "04",
    title: "Your trade",
    body: "Tell us about the vehicle you have. We call you with an offer. This site does not produce an instant value.",
  },
];

export default async function HomePage() {
  const snapshot = await getInventory();
  const featured = selectFeatured(snapshot.vehicles, 5);
  const catalog = buildCatalog(snapshot.vehicles);
  const [lead, ...rest] = featured;
  const leadPhoto = lead?.photos[0];

  return (
    <>
      <section className="relative overflow-hidden">
        {heroMedia?.type === "image" ? (
          <Image src={heroMedia.src} alt={heroMedia.alt} fill priority className="object-cover" sizes="100vw" />
        ) : null}
        {heroMedia?.type === "video" ? (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster={heroMedia.poster}>
            <source src={heroMedia.src} />
          </video>
        ) : null}
        {heroMedia ? (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0c] via-[#0e0e0c]/80 to-[#0e0e0c]/50" />
        ) : (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(246,244,239,0.14),transparent_64%)]" />
            <div className="absolute bottom-[-8rem] left-[-6rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(159,28,28,0.28),transparent_68%)]" />
            <p className="absolute top-16 -left-2 hidden select-none font-display text-[18vw] leading-none tracking-tighter text-white/[0.045] md:block">
              Central
            </p>
          </div>
        )}
        <Container className="relative pt-28 pb-12 md:flex md:min-h-[100svh] md:flex-col md:justify-end md:pt-32 md:pb-16">
          <p className="text-xs uppercase tracking-[0.28em] text-[#c9c3b6]">Central Ave Motors · Yonkers, New York</p>
          <h1 className="cam-rise mt-5 max-w-[12ch] font-display text-[clamp(3.2rem,7.4vw,6.5rem)] leading-[0.92] tracking-tight">
            Pre-owned luxury, without the runaround.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#c9c3b6]">
            An independent dealer on Central Park Avenue. Every advertised price includes our charges. Buy here, or from another state: we arrange shipping and handle out-of-state registration and temporary tags.
          </p>
          <p className="mt-5 text-sm">
            <Link href="/inventory" className="underline decoration-[#9f1c1c] underline-offset-4">
              {snapshot.vehicles.length} vehicles in inventory
            </Link>
          </p>
          <div className="mt-10">
            <QuickSearch catalog={catalog} />
          </div>
        </Container>
      </section>

      {lead ? (
        <section className="border-t border-white/10 py-20 md:py-28">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-5xl tracking-tight md:text-6xl">In the showroom</h2>
                <p className="mt-4 max-w-xl text-[#c9c3b6]">
                  A few of the cars on the lot right now. Photos are shown at their original size inside a light frame.
                </p>
              </div>
              <Link href="/inventory" className="text-sm underline decoration-[#9f1c1c] underline-offset-4">
                View the full inventory
              </Link>
            </div>
            <div className="mt-6 max-w-2xl">
              <PriceNote />
            </div>
            <article className="mt-10 grid bg-[#f3f2ee] text-[#1c1b18] md:grid-cols-2">
              <div className="bg-white p-4 md:p-8">
                {leadPhoto ? (
                  <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px]">
                    <Image
                      src={leadPhoto.src}
                      alt={leadPhoto.alt}
                      fill
                      priority
                      className="object-contain"
                      sizes="(max-width: 768px) 92vw, 560px"
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col justify-center p-6 md:p-10">
                <p className="text-xs uppercase tracking-[0.2em] text-[#4a463f]">
                  {lead.year} · {lead.make}
                </p>
                <h3 className="mt-3 font-display text-5xl leading-none tracking-tight">{lead.model}</h3>
                {lead.trim ? <p className="mt-3 text-sm text-[#4a463f]">{lead.trim}</p> : null}
                <p className="mt-8 font-display text-4xl">{formatPrice(lead.price)}</p>
                <p className="mt-2 text-sm text-[#4a463f]">
                  {formatMiles(lead.miles)}
                  {lead.color ? ` · ${lead.color}` : ""}
                </p>
                <Link
                  href={`/inventory/${lead.slug}`}
                  className="mt-8 inline-flex h-12 items-center justify-center bg-[#9f1c1c] px-6 text-white"
                >
                  View this car
                </Link>
                <span className="sr-only">{vehicleTitle(lead)}</span>
              </div>
            </article>
            {rest.length > 0 ? (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {rest.map((vehicle) => (
                  <li key={vehicle.vin}>
                    <VehicleCard vehicle={vehicle} />
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </section>
      ) : null}

      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <h2 className="max-w-[14ch] font-display text-5xl tracking-tight md:text-6xl">Buy from anywhere</h2>
          <p className="mt-4 max-w-xl text-lg text-[#c9c3b6]">
            You do not need to be in Yonkers to buy. Most of the purchase can be finished remotely, then we ship the car.
          </p>
          <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
            {STEPS.map((step) => (
              <li key={step.number} className="border-t border-white/15 pt-5">
                <p className="font-display text-3xl text-[#9f1c1c]">{step.number}</p>
                <h3 className="mt-4 font-display text-3xl tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#c9c3b6]">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <h2 className="font-display text-5xl tracking-tight md:text-6xl">Reviews</h2>
          <p className="mt-4 max-w-xl text-[#c9c3b6]">
            Verified buyer reviews will be published here. None are on the site yet.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {["First review", "Second review", "Third review"].map((label) => (
              <li key={label} className="bg-[#f3f2ee] p-6 text-[#1c1b18]">
                <p className="text-xs uppercase tracking-[0.18em] text-[#4a463f]">Review pending</p>
                <p className="mt-4 font-display text-3xl leading-snug">A comment from a verified buyer will appear here.</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/10 py-20 md:py-28">
        <Container className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="font-display text-5xl tracking-tight md:text-6xl">The showroom</h2>
            <p className="mt-6 font-display text-3xl leading-snug">{formatAddress()}</p>
            <p className="mt-4">
              <PhoneLink location="home-location" className="underline underline-offset-4" />
            </p>
            <div className="mt-6 max-w-sm text-[#c9c3b6]">
              <HoursList />
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/contact" className="underline underline-offset-4">
                Contact
              </Link>
              <a href={directionsHref()} className="underline underline-offset-4">
                Directions
              </a>
            </div>
          </div>
          <div className="min-h-80 bg-white ring-1 ring-white/15">
            <iframe
              title="Map showing Central Ave Motors at 1980 Central Park Ave, Yonkers, NY"
              src={mapEmbedSrc()}
              className="h-80 w-full border-0 md:h-full md:min-h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container>
      </section>
    </>
  );
}

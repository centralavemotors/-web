import Link from "next/link";
import { Container } from "@/components/container";
import { PhoneLink } from "@/components/phone-link";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="text-xs uppercase tracking-[0.22em] text-[#c9c3b6]">404</p>
      <h1 className="mt-3 font-display text-6xl tracking-tight">That page is not here.</h1>
      <p className="mt-4 max-w-md text-[#c9c3b6]">
        The vehicle may have left the current inventory, or the address is wrong.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/inventory" className="inline-flex h-12 items-center bg-[#9f1c1c] px-5 text-white">
          Browse inventory
        </Link>
        <PhoneLink location="not-found" className="inline-flex h-12 items-center border border-white/20 px-5" />
      </div>
    </Container>
  );
}

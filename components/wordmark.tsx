import Image from "next/image";
import Link from "next/link";
import { logo } from "@/lib/site";

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      {logo.src ? (
        <Image src={logo.src} alt={logo.alt} width={180} height={48} className="h-10 w-auto" />
      ) : (
        <>
          <span className="h-8 w-1.5 bg-[#9f1c1c]" aria-hidden="true" />
          <span>
            <span className="block font-display text-[1.35rem] leading-none tracking-tight">Central Ave</span>
            <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.28em]">Motors</span>
          </span>
        </>
      )}
    </Link>
  );
}

import Link from "next/link";
import { PRICING_DISCLAIMER } from "@/lib/site";

export function PriceNote({ tone = "dark" }: { tone?: "dark" | "paper" }) {
  const color = tone === "paper" ? "text-[#4a463f]" : "text-[#c9c3b6]";
  return (
    <p className={`text-sm leading-relaxed ${color}`}>
      {PRICING_DISCLAIMER.short}{" "}
      <Link href="/legal#pricing" className="underline decoration-[#9f1c1c] underline-offset-4">
        Pricing disclosure
      </Link>
    </p>
  );
}

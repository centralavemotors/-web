"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, formatPrice } from "@/lib/format";
import { PRICING_DISCLAIMER } from "@/lib/site";

const TERMS = [24, 36, 48, 60, 72, 84];

type EstimateResult =
  | { kind: "error"; error: string }
  | { kind: "hint"; hint: string }
  | { kind: "ok"; payment: number; principal: number; rate: number };

function monthlyPayment(principal: number, aprPercent: number, months: number) {
  if (principal <= 0 || months <= 0 || aprPercent < 0) return null;
  const rate = aprPercent / 100 / 12;
  if (rate === 0) return principal / months;
  const factor = (1 + rate) ** months;
  return (principal * rate * factor) / (factor - 1);
}

export function PaymentEstimator({ price }: { price: number }) {
  const [down, setDown] = useState("");
  const [apr, setApr] = useState("");
  const [months, setMonths] = useState(60);

  const result = useMemo((): EstimateResult => {
    const downPayment = Number(down.replace(/[^0-9.]/g, ""));
    const rate = apr.trim() === "" ? null : Number(apr);
    if (!Number.isFinite(downPayment) || downPayment < 0) {
      return { kind: "error", error: "Enter a down payment of zero or more." };
    }
    if (downPayment > price) {
      return { kind: "error", error: "The down payment is higher than the advertised price." };
    }
    if (rate == null) {
      return { kind: "hint", hint: "Enter an annual percentage rate to see an estimate." };
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 99) {
      return { kind: "error", error: "Enter a rate between 0 and 99." };
    }
    const principal = price - downPayment;
    const payment = monthlyPayment(principal, rate, months);
    if (payment == null) {
      return { kind: "error", error: "That combination does not produce a payment." };
    }
    return { kind: "ok", payment, principal, rate };
  }, [apr, down, months, price]);

  return (
    <section id="payment" className="paper-panel p-6 sm:p-8">
      <h2 className="font-display text-4xl tracking-tight">Payment estimate</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#4a463f]">
        This is an estimate, not a credit offer. Enter your own annual percentage rate. {PRICING_DISCLAIMER.short} Nothing here is an approval or a promised rate.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="pay-down">Down payment</Label>
          <Input
            id="pay-down"
            inputMode="decimal"
            value={down}
            placeholder="0"
            onChange={(event) => setDown(event.target.value)}
            className="bg-white text-[#1c1b18]"
            data-clarity-mask="true"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pay-apr">Your APR %</Label>
          <Input
            id="pay-apr"
            inputMode="decimal"
            value={apr}
            placeholder="Enter a rate"
            onChange={(event) => setApr(event.target.value)}
            className="bg-white text-[#1c1b18]"
            data-clarity-mask="true"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pay-term">Term</Label>
          <select
            id="pay-term"
            className="cam-select cam-select-light h-12 w-full border border-black/15 bg-white px-3 text-base"
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
          >
            {TERMS.map((term) => (
              <option key={term} value={term}>
                {term} months
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#4a463f]">Advertised price {formatPrice(price)}.</p>
      <div aria-live="polite" className="mt-4">
        {result.kind === "error" ? <p className="text-sm">{result.error}</p> : null}
        {result.kind === "hint" ? <p className="text-sm">{result.hint}</p> : null}
        {result.kind === "ok" ? (
          <>
            <p className="font-display text-4xl tracking-tight">
              {formatMoney(result.payment)}
              <span className="ml-2 font-sans text-base text-[#4a463f]">per month, estimate</span>
            </p>
            <p className="mt-2 text-sm text-[#4a463f]">
              Amount financed in this estimate: {formatMoney(result.principal)}. Rate used: {result.rate}%.
            </p>
          </>
        ) : null}
      </div>
    </section>
  );
}

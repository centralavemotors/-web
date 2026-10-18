"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readStoredUtm, track } from "@/lib/analytics";
import type { LeadIntent } from "@/lib/leads/intents";
import type { LeadVehicle } from "@/lib/lead-vehicle";
import { phone } from "@/lib/site";
import { PhoneLink } from "./phone-link";

const MASK = { "data-clarity-mask": "true", className: "clarity-mask bg-white text-[#1c1b18]" };

export function LeadForm({
  intent,
  vehicle,
  submitLabel,
}: {
  intent: LeadIntent;
  vehicle?: LeadVehicle;
  submitLabel: string;
}) {
  const uid = useId();
  const started = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [tradeYear, setTradeYear] = useState("");
  const [tradeMake, setTradeMake] = useState("");
  const [tradeModel, setTradeModel] = useState("");
  const [tradeMiles, setTradeMiles] = useState("");
  const [tradeVin, setTradeVin] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  function markStart() {
    if (started.current) return;
    started.current = true;
    track({ name: "form_start", payload: { form: intent } });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors([]);
    const utm = readStoredUtm();
    const payload = {
      intent,
      name,
      email,
      phone: phoneNumber,
      message,
      company_url: companyUrl,
      preferredDate,
      tradeYear,
      tradeMake,
      tradeModel,
      tradeMiles,
      tradeVin,
      shippingState,
      postalCode,
      pageUrl: window.location.href,
      ...utm,
      ...vehicle,
    };
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { ok: boolean; id?: string; errors?: string[] };
      if (!response.ok || !body.ok) {
        setErrors(body.errors?.length ? body.errors : ["We could not send that. Please call the dealership."]);
        alertRef.current?.focus();
        return;
      }
      track({ name: "form_submit", payload: { form: intent, vin: vehicle?.vin, eventId: body.id } });
      setDone(true);
    } catch {
      setErrors([`We could not send that. Call ${phone.display} and we will help.`]);
      alertRef.current?.focus();
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="grid gap-3">
        <h3 className="font-display text-3xl tracking-tight">Request sent</h3>
        <p className="text-sm leading-relaxed text-[#4a463f]">
          The dealership has your request. If you need an answer sooner, call {phone.display}.
        </p>
        <PhoneLink location={`form-${intent}`} className="text-sm underline underline-offset-4">
          Call {phone.display}
        </PhoneLink>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit} onFocus={markStart} noValidate>
      {errors.length > 0 ? (
        <div ref={alertRef} tabIndex={-1} role="alert" className="border border-[#9f1c1c] px-3 py-3 text-sm">
          <ul className="grid gap-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-company`}>
          Company website
          <input
            id={`${uid}-company`}
            tabIndex={-1}
            autoComplete="off"
            value={companyUrl}
            onChange={(event) => setCompanyUrl(event.target.value)}
          />
        </label>
      </div>
      <Field id={`${uid}-name`} label="Name">
        <Input
          id={`${uid}-name`}
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          {...MASK}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-email`} label="Email">
          <Input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            {...MASK}
          />
        </Field>
        <Field id={`${uid}-phone`} label="Phone">
          <Input
            id={`${uid}-phone`}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            {...MASK}
          />
        </Field>
      </div>
      {intent === "test_drive" ? (
        <Field id={`${uid}-date`} label="Preferred day">
          <Input
            id={`${uid}-date`}
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
            {...MASK}
          />
        </Field>
      ) : null}
      {intent === "trade_in" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${uid}-ty`} label="Trade year">
            <Input id={`${uid}-ty`} inputMode="numeric" value={tradeYear} onChange={(event) => setTradeYear(event.target.value)} {...MASK} />
          </Field>
          <Field id={`${uid}-tmake`} label="Trade make">
            <Input id={`${uid}-tmake`} value={tradeMake} onChange={(event) => setTradeMake(event.target.value)} {...MASK} />
          </Field>
          <Field id={`${uid}-tmodel`} label="Trade model">
            <Input id={`${uid}-tmodel`} value={tradeModel} onChange={(event) => setTradeModel(event.target.value)} {...MASK} />
          </Field>
          <Field id={`${uid}-tmiles`} label="Trade mileage">
            <Input id={`${uid}-tmiles`} inputMode="numeric" value={tradeMiles} onChange={(event) => setTradeMiles(event.target.value)} {...MASK} />
          </Field>
          <Field id={`${uid}-tvin`} label="Trade VIN, if you have it">
            <Input id={`${uid}-tvin`} value={tradeVin} onChange={(event) => setTradeVin(event.target.value)} className="clarity-mask bg-white font-mono text-[#1c1b18]" data-clarity-mask="true" />
          </Field>
        </div>
      ) : null}
      {intent === "shipping_quote" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${uid}-state`} label="Ship to state">
            <Input
              id={`${uid}-state`}
              maxLength={2}
              value={shippingState}
              onChange={(event) => setShippingState(event.target.value.toUpperCase())}
              {...MASK}
            />
          </Field>
          <Field id={`${uid}-zip`} label="ZIP code">
            <Input
              id={`${uid}-zip`}
              inputMode="numeric"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              {...MASK}
            />
          </Field>
        </div>
      ) : null}
      <Field id={`${uid}-message`} label="Message">
        <Textarea
          id={`${uid}-message`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="clarity-mask bg-white text-[#1c1b18]"
          data-clarity-mask="true"
        />
      </Field>
      <p className="text-sm leading-relaxed text-[#4a463f]">
        Enter an email or a phone number. This request goes to the dealership. It is not a credit application and it does not charge a card.
      </p>
      <Button type="submit" className="h-12" disabled={pending}>
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

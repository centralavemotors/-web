import "server-only";
import { leadBackupAddress, leadToAddress } from "./destination";
import { clientIp, originAllowed } from "./http";
import { sendMetaLeadEvent } from "./meta-capi";
import { createRateLimiter } from "./rate-limit";
import { decideLead, type LeadDelivery } from "./validate";

const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

async function sendWithResend(message: LeadDelivery) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    console.info("[leads] Resend is not configured. ADF lead follows and was not emailed.");
    console.info(message.subject);
    console.info(message.xml);
    return { ok: true as const };
  }

  const to = leadToAddress();
  const backup = leadBackupAddress();
  const bcc = backup && backup.toLowerCase() !== to.toLowerCase() ? [backup] : undefined;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      bcc,
      subject: message.subject,
      text: message.xml,
    }),
  });
  if (!response.ok) {
    console.error("[leads] Resend failed", response.status);
    return { ok: false as const };
  }
  return { ok: true as const };
}

export async function handleLeadRequest(request: Request) {
  let json: unknown;
  try {
    const text = await request.text();
    if (text.length > 20_000) {
      return Response.json(
        { ok: false, errors: ["That submission is too large."] },
        { status: 413 },
      );
    }
    json = JSON.parse(text);
  } catch {
    return Response.json(
      { ok: false, errors: ["We could not read that submission."] },
      { status: 400 },
    );
  }

  const decision = decideLead(json, {
    now: new Date(),
    ip: clientIp(request),
    originOk: originAllowed(request),
    allow,
  });
  if (!decision.deliver) {
    return Response.json(decision.body, { status: decision.httpStatus });
  }

  try {
    const sent = await sendWithResend(decision.deliver);
    if (!sent.ok) {
      return Response.json(
        { ok: false, errors: ["We could not send that just now. Please call the dealership."] },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[leads] delivery error", error instanceof Error ? error.message : "unknown");
    return Response.json(
      { ok: false, errors: ["We could not send that just now. Please call the dealership."] },
      { status: 502 },
    );
  }

  await sendMetaLeadEvent({
    eventId: decision.deliver.eventId,
    pageUrl: decision.deliver.pageUrl,
    email: decision.deliver.email,
    phone: decision.deliver.phone,
    intent: decision.deliver.intent,
    vin: decision.deliver.vin,
    price: decision.deliver.price,
    ip: clientIp(request),
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return Response.json({ ok: true, id: decision.deliver.eventId });
}

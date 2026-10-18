import "server-only";
import { createHash } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string) {
  return sha256(email.trim().toLowerCase());
}

function hashPhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `1${digits}`;
  return sha256(digits);
}

export async function sendMetaLeadEvent(input: {
  eventId: string;
  pageUrl?: string;
  email?: string;
  phone?: string;
  intent: string;
  vin?: string;
  price?: number;
  ip?: string;
  userAgent?: string;
}) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!token || !pixelId) {
    console.info("[meta-capi] skipped; access token or pixel id is not set");
    return;
  }
  if (!/^\d{5,20}$/.test(pixelId)) {
    console.error("[meta-capi] pixel id is not numeric; event not sent");
    return;
  }

  const userData: Record<string, string | string[] | undefined> = {};
  if (input.email) userData.em = [hashEmail(input.email)];
  if (input.phone) userData.ph = [hashPhone(input.phone)];
  if (input.ip) userData.client_ip_address = input.ip;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.pageUrl,
        user_data: userData,
        custom_data: {
          content_name: input.intent,
          content_type: "vehicle",
          content_ids: input.vin ? [input.vin] : undefined,
          currency: "USD",
          value: input.price,
        },
      },
    ],
  };
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testCode) payload.test_event_code = testCode;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!response.ok) {
      console.error("[meta-capi] request failed", response.status);
    }
  } catch (error) {
    console.error("[meta-capi] request error", error instanceof Error ? error.message : "unknown");
  }
}

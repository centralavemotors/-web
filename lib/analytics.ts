"use client";

export type AnalyticsEvent =
  | {
      name: "vehicle_view";
      payload: { vin: string; year: number; make: string; model: string; price: number; slug: string };
    }
  | { name: "cta_click"; payload: { cta: string; vin?: string; page: string } }
  | { name: "phone_click"; payload: { location: string } }
  | { name: "text_click"; payload: { location: string } }
  | { name: "form_start"; payload: { form: string } }
  | { name: "form_submit"; payload: { form: string; vin?: string; eventId?: string } }
  | { name: "filter_use"; payload: { filter: string; value: string } }
  | { name: "search"; payload: { query: string } };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __camGa4?: boolean;
    __camPixel?: boolean;
  }
}

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: event.name, ...event.payload });

  if (window.__camGa4 && window.gtag) {
    window.gtag("event", event.name, event.payload);
  }
  if (!window.__camPixel || !window.fbq) return;

  if (event.name === "vehicle_view") {
    window.fbq("track", "ViewContent", {
      content_type: "vehicle",
      content_ids: [event.payload.vin],
      content_name: `${event.payload.year} ${event.payload.make} ${event.payload.model}`,
      value: event.payload.price,
      currency: "USD",
    });
  }
  if (event.name === "form_submit") {
    window.fbq(
      "track",
      "Lead",
      { content_name: event.payload.form, content_ids: event.payload.vin ? [event.payload.vin] : undefined },
      event.payload.eventId ? { eventID: event.payload.eventId } : undefined,
    );
  }
}

export function readStoredUtm() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem("cam-utm");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const pick = (key: string) => (typeof parsed[key] === "string" ? parsed[key] : undefined);
    return {
      utmSource: pick("utm_source"),
      utmMedium: pick("utm_medium"),
      utmCampaign: pick("utm_campaign"),
      utmTerm: pick("utm_term"),
      utmContent: pick("utm_content"),
    };
  } catch {
    return {};
  }
}

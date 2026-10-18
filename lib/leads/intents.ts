export const LEAD_INTENTS = [
  "contact",
  "test_drive",
  "check_availability",
  "trade_in",
  "reserve",
  "shipping_quote",
  "financing",
] as const;

export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const LEAD_LABELS: Record<LeadIntent, string> = {
  contact: "Contact",
  test_drive: "Test drive",
  check_availability: "Check availability",
  trade_in: "Trade-in",
  reserve: "Reserve request",
  shipping_quote: "Shipping quote",
  financing: "Financing inquiry",
};

import { xmlTag, xmlText } from "../xml";

export type AdfInterest = "buy" | "lease" | "sell" | "trade-in" | "test-drive";

export type AdfVehicle = {
  interest: AdfInterest;
  status?: "new" | "used";
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;
  stock?: string;
  odometer?: string;
  price?: string;
  exteriorColor?: string;
};

export type AdfLead = {
  id: string;
  date: Date;
  pageUrl?: string;
  customer: {
    fullName: string;
    email?: string;
    phone?: string;
    postalCode?: string;
    region?: string;
    comments?: string;
  };
  vehicles: AdfVehicle[];
  vendorName: string;
  vendorPhone?: string;
  providerName?: string;
  providerService?: string;
};

export function formatAdfDate(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function nationalPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0] ?? "", last: "" };
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

function vehicleXml(vehicle: AdfVehicle) {
  const color = vehicle.exteriorColor
    ? xmlTag("colorcombination", xmlText("exteriorcolor", vehicle.exteriorColor))
    : "";
  const inner = [
    xmlText("year", vehicle.year),
    xmlText("make", vehicle.make),
    xmlText("model", vehicle.model),
    xmlText("trim", vehicle.trim),
    xmlText("vin", vehicle.vin),
    xmlText("stock", vehicle.stock),
    vehicle.odometer
      ? xmlText("odometer", vehicle.odometer, { units: "mi" })
      : "",
    vehicle.price
      ? xmlText("price", vehicle.price, { type: "asking", currency: "USD" })
      : "",
    color,
  ].join("");
  return xmlTag("vehicle", inner, {
    interest: vehicle.interest,
    status: vehicle.status ?? "used",
  });
}

export function buildAdfLead(lead: AdfLead) {
  const { first, last } = splitName(lead.customer.fullName);
  const names = [
    xmlText("name", lead.customer.fullName, { part: "full" }),
    xmlText("name", first, { part: "first" }),
    xmlText("name", last, { part: "last" }),
  ].join("");
  const address =
    lead.customer.postalCode || lead.customer.region
      ? xmlTag(
          "address",
          [
            xmlText("regioncode", lead.customer.region),
            xmlText("postalcode", lead.customer.postalCode),
            xmlText("country", "US"),
          ].join(""),
        )
      : "";
  const contact = xmlTag(
    "contact",
    [
      names,
      xmlText("email", lead.customer.email),
      lead.customer.phone
        ? xmlText("phone", nationalPhone(lead.customer.phone), { type: "voice" })
        : "",
      address,
    ].join(""),
  );
  const customer = xmlTag(
    "customer",
    [contact, xmlText("comments", lead.customer.comments)].join(""),
  );
  const vendorContact = xmlTag(
    "contact",
    [
      xmlText("name", lead.vendorName, { part: "full" }),
      lead.vendorPhone
        ? xmlText("phone", nationalPhone(lead.vendorPhone), { type: "voice" })
        : "",
    ].join(""),
  );
  const vendor = xmlTag(
    "vendor",
    [xmlText("vendorname", lead.vendorName), vendorContact].join(""),
  );
  const provider = xmlTag(
    "provider",
    [
      xmlText("name", lead.providerName ?? "Central Ave Motors Website", { part: "full" }),
      xmlText("service", lead.providerService ?? "Website"),
      xmlText("url", lead.pageUrl),
    ].join(""),
  );
  const prospect = xmlTag(
    "prospect",
    [
      xmlText("id", lead.id, { sequence: "1", source: lead.vendorName }),
      xmlText("requestdate", formatAdfDate(lead.date)),
      lead.vehicles.map(vehicleXml).join(""),
      customer,
      vendor,
      provider,
    ].join(""),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<?adf version="1.0"?>\n${xmlTag("adf", prospect)}`;
}

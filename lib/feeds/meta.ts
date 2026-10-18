import { vehicleSummary, vehicleTitle } from "../format";
import { address, headlinePrice } from "../site";
import { escapeXml, xmlTag, xmlText } from "../xml";
import type { BodyStyle, Vehicle } from "../inventory/types";

const META_BODY: Record<BodyStyle, string> = {
  Sedan: "SEDAN",
  Coupe: "COUPE",
  SUV: "SUV",
  Convertible: "CONVERTIBLE",
  Wagon: "WAGON",
  Hatchback: "HATCHBACK",
  Truck: "TRUCK",
  Van: "VAN",
  Other: "OTHER",
};

function listingXml(vehicle: Vehicle, pageUrl: string, dealerId: string) {
  const images = vehicle.photos
    .map((photo) => xmlTag("image", xmlText("url", photo.src)))
    .join("");
  const addressXml = xmlTag(
    "address",
    [
      xmlText("component", address.street, { name: "addr1" }),
      xmlText("component", address.city, { name: "city" }),
      xmlText("component", address.region, { name: "region" }),
      xmlText("component", address.postalCode, { name: "postal_code" }),
      xmlText("component", address.country, { name: "country" }),
    ].join(""),
    { format: "simple" },
  );
  return xmlTag(
    "listing",
    [
      xmlText("vehicle_id", vehicle.vin),
      xmlText("vin", vehicle.vin),
      xmlText("title", vehicleTitle(vehicle)),
      xmlText("description", vehicleSummary(vehicle)),
      xmlText("url", pageUrl),
      xmlText("make", vehicle.make),
      xmlText("model", vehicle.model),
      xmlText("year", vehicle.year),
      xmlText("trim", vehicle.trim),
      xmlTag("mileage", [xmlText("value", vehicle.miles), xmlText("unit", "MI")].join("")),
      images,
      xmlText("body_style", META_BODY[vehicle.body]),
      xmlText("price", `${headlinePrice(vehicle.price).toFixed(2)} USD`),
      xmlText("exterior_color", vehicle.color ?? "Not specified"),
      xmlText("state_of_vehicle", "Used"),
      xmlText("availability", "AVAILABLE"),
      addressXml,
      xmlText("latitude", address.latitude),
      xmlText("longitude", address.longitude),
      xmlText("dealer_id", dealerId),
    ].join(""),
  );
}

export function buildMetaAutomotiveFeed(
  vehicles: Vehicle[],
  options: {
    siteUrl: string;
    feedUrl: string;
    dealerId: string;
    linkFor: (vehicle: Vehicle) => string;
  },
) {
  const listings = vehicles
    .map((vehicle) => listingXml(vehicle, options.linkFor(vehicle), options.dealerId))
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
${xmlTag(
  "listings",
  [
    xmlText("title", "Central Ave Motors inventory"),
    `<link rel="self" href="${escapeXml(options.feedUrl)}"/>`,
    listings,
  ].join(""),
)}`;
}

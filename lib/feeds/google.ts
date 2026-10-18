import { vehicleSummary, vehicleTitle } from "../format";
import { address } from "../site";
import { escapeXml, xmlText } from "../xml";
import type { BodyStyle, Vehicle } from "../inventory/types";

const GOOGLE_BODY: Record<BodyStyle, string> = {
  Sedan: "sedan",
  Coupe: "coupe",
  SUV: "suv",
  Convertible: "convertible",
  Wagon: "wagon",
  Hatchback: "hatchback",
  Truck: "truck",
  Van: "van",
  Other: "other",
};

function itemXml(vehicle: Vehicle, pageUrl: string, storeCode: string) {
  const [primary, ...rest] = vehicle.photos;
  const title = vehicleTitle(vehicle);
  const parts = [
    xmlText("g:id", vehicle.vin),
    xmlText("g:vin", vehicle.vin),
    xmlText("g:title", title),
    xmlText("g:description", vehicleSummary(vehicle)),
    xmlText("g:link", pageUrl),
    primary ? xmlText("g:image_link", primary.src) : "",
    ...rest.map((photo) => xmlText("g:additional_image_link", photo.src)),
    xmlText("g:availability", "in_stock"),
    xmlText("g:price", `${vehicle.price.toFixed(2)} USD`),
    xmlText("g:condition", "used"),
    xmlText("g:brand", vehicle.make),
    xmlText(
      "g:google_product_category",
      "Vehicles & Parts > Vehicles > Motor Vehicles > Cars, Trucks & Vans",
    ),
    xmlText("g:identifier_exists", "no"),
    xmlText("g:year", vehicle.year),
    xmlText("g:make", vehicle.make),
    xmlText("g:model", vehicle.model),
    xmlText("g:trim", vehicle.trim),
    xmlText("g:mileage", `${vehicle.miles} Miles`),
    xmlText("g:color", vehicle.color),
    xmlText("g:body_style", GOOGLE_BODY[vehicle.body]),
    xmlText("g:certified_pre-owned", "no"),
    xmlText("g:store_code", storeCode),
    xmlText("g:vehicle_fulfillment", `in_store:${storeCode}`),
    xmlText("g:vehicle_location", `${address.city}, ${address.region}`),
  ];
  return `<item>\n${parts.filter(Boolean).join("\n")}\n</item>`;
}

export function buildGoogleVehicleFeed(
  vehicles: Vehicle[],
  options: { siteUrl: string; storeCode: string; linkFor: (vehicle: Vehicle) => string },
) {
  const items = vehicles.map((vehicle) => itemXml(vehicle, options.linkFor(vehicle), options.storeCode));
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${escapeXml("Central Ave Motors inventory")}</title>
<link>${escapeXml(options.siteUrl)}</link>
<description>${escapeXml("Pre-owned vehicles advertised by Central Ave Motors in Yonkers, NY.")}</description>
${items.join("\n")}
</channel>
</rss>`;
}

import { vehicleSummary, vehicleTitle } from "./format";
import { address, headlinePrice, phone, siteName, siteUrl } from "./site";
import type { Vehicle } from "./inventory/types";

export function dealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteUrl()}/#dealer`,
    name: siteName,
    url: siteUrl(),
    telephone: phone.e164,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: address.latitude,
      longitude: address.longitude,
    },
    areaServed: "US",
  };
}

export function vehicleJsonLd(vehicle: Vehicle, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleTitle(vehicle),
    description: vehicleSummary(vehicle),
    vehicleIdentificationNumber: vehicle.vin,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    vehicleConfiguration: vehicle.trim ?? undefined,
    bodyType: vehicle.body,
    color: vehicle.color ?? undefined,
    image: vehicle.photos.map((photo) => photo.src),
    itemCondition: "https://schema.org/UsedCondition",
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.miles,
      unitCode: "SMI",
    },
    offers: {
      "@type": "Offer",
      price: headlinePrice(vehicle.price),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": `${siteUrl()}/#dealer` },
    },
  };
}

export function breadcrumbJsonLd(vehicle: Vehicle, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
      { "@type": "ListItem", position: 2, name: "Inventory", item: `${siteUrl()}/inventory` },
      { "@type": "ListItem", position: 3, name: vehicleTitle(vehicle), item: pageUrl },
    ],
  };
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { buildGoogleVehicleFeed } from "./feeds/google";
import { buildMetaAutomotiveFeed } from "./feeds/meta";
import { formatPrice } from "./format";
import { normalizeVehicle } from "./inventory/normalize";
import type { RawVehicle, Vehicle } from "./inventory/types";
import { vehicleJsonLd } from "./seo";
import { headlinePrice, headlinePriceMode } from "./site";

const vehicles = (JSON.parse(readFileSync("data/inventory.seed.json", "utf8")) as RawVehicle[])
  .map((row) => normalizeVehicle(row))
  .filter((vehicle): vehicle is Vehicle => vehicle != null);

const linkFor = (vehicle: Vehicle) => `https://www.centralavemotors.com/inventory/${vehicle.slug}`;

const feeWording =
  /processing[\s-]+fees?|\$650|doc(?:umentation)?[\s-]+fees?|no hidden fees|every advertised price includes our charges/i;

function taggedPrice(xml: string, vin: string, open: string, idTag: string, priceTag: string) {
  const block = xml.split(open).find((chunk) => chunk.includes(`<${idTag}>${vin}</${idTag}>`));
  const match = block?.match(new RegExp(`<${priceTag}>([\\d.]+) USD</${priceTag}>`));
  assert.ok(match, `${priceTag} for ${vin}`);
  return Number(match[1]);
}

describe("one published price", () => {
  it("matches the feed, JSON-LD offer, and vehicle page for every vehicle", () => {
    assert.equal(headlinePriceMode, "list");
    assert.ok(vehicles.length > 0);
    const dealSheet = readFileSync("components/deal-sheet.tsx", "utf8");
    assert.match(dealSheet, /formatPrice\(headlinePrice\(vehicle\.price\)\)/);
    assert.doesNotMatch(dealSheet, feeWording);
    assert.match(readFileSync("components/vehicle-card.tsx", "utf8"), /formatPrice\(headlinePrice\(vehicle\.price\)\)/);
    assert.match(readFileSync("app/page.tsx", "utf8"), /formatPrice\(headlinePrice\(lead\.price\)\)/);

    const google = buildGoogleVehicleFeed(vehicles, {
      siteUrl: "https://www.centralavemotors.com",
      storeCode: "CAM-YONKERS",
      linkFor,
    });
    const meta = buildMetaAutomotiveFeed(vehicles, {
      siteUrl: "https://www.centralavemotors.com",
      feedUrl: "https://www.centralavemotors.com/feeds/meta-automotive.xml",
      dealerId: "CAM-YONKERS",
      linkFor,
    });
    assert.doesNotMatch(google, feeWording);
    assert.doesNotMatch(meta, feeWording);

    for (const vehicle of vehicles) {
      const displayed = headlinePrice(vehicle.price);
      assert.equal(displayed, vehicle.price);
      assert.equal(formatPrice(displayed), formatPrice(vehicle.price));
      assert.equal(vehicleJsonLd(vehicle, linkFor(vehicle)).offers.price, displayed);
      assert.equal(taggedPrice(google, vehicle.vin, "<item>", "g:id", "g:price"), displayed);
      assert.equal(taggedPrice(meta, vehicle.vin, "<listing>", "vehicle_id", "price"), displayed);
      assert.doesNotMatch(String(vehicleJsonLd(vehicle, linkFor(vehicle)).description), feeWording);
    }
  });
});

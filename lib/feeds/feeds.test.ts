import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Vehicle } from "../inventory/types";
import { buildGoogleVehicleFeed } from "./google";
import { buildMetaAutomotiveFeed } from "./meta";

const vehicle: Vehicle = {
  vin: "WBS63AY02RFR82645",
  year: 2024,
  make: "BMW",
  model: "M3",
  trim: 'CS & "Edition"',
  miles: 25615,
  price: 117500,
  body: "Sedan",
  bodyDerived: true,
  color: "Frozen Solid White",
  photos: [
    { src: "https://images.autofunds.net/one.jpg", alt: "one" },
    { src: "https://images.autofunds.net/two.jpg", alt: "two" },
  ],
  slug: "2024-bmw-m3-wbs63ay02rfr82645",
  legacyPath: null,
  stock: null,
};

const linkFor = (item: Vehicle) => `https://www.centralavemotors.com/inventory/${item.slug}`;

describe("ad feeds", () => {
  it("builds a Google vehicle ads item with price, mileage, VIN, and escaped trim", () => {
    const xml = buildGoogleVehicleFeed([vehicle], {
      siteUrl: "https://www.centralavemotors.com",
      storeCode: "CAM-YONKERS",
      linkFor,
    });
    assert.match(xml, /xmlns:g="http:\/\/base.google.com\/ns\/1.0"/);
    assert.match(xml, /<g:id>WBS63AY02RFR82645<\/g:id>/);
    assert.match(xml, /<g:price>117500.00 USD<\/g:price>/);
    assert.match(xml, /<g:mileage>25615 Miles<\/g:mileage>/);
    assert.match(xml, /<g:condition>used<\/g:condition>/);
    assert.match(xml, /<g:body_style>sedan<\/g:body_style>/);
    assert.match(xml, /<g:store_code>CAM-YONKERS<\/g:store_code>/);
    assert.match(xml, /<g:vehicle_fulfillment>in_store:CAM-YONKERS<\/g:vehicle_fulfillment>/);
    assert.match(xml, /<g:image_link>https:\/\/images.autofunds.net\/one.jpg<\/g:image_link>/);
    assert.match(xml, /<g:additional_image_link>https:\/\/images.autofunds.net\/two.jpg<\/g:additional_image_link>/);
    assert.match(xml, /CS &amp; &quot;Edition&quot;/);
    assert.equal(xml.includes('CS & "Edition"'), false);
  });

  it("builds a Meta automotive listing", () => {
    const xml = buildMetaAutomotiveFeed([vehicle], {
      siteUrl: "https://www.centralavemotors.com",
      feedUrl: "https://www.centralavemotors.com/feeds/meta-automotive.xml",
      dealerId: "CAM-YONKERS",
      linkFor,
    });
    assert.match(xml, /<vehicle_id>WBS63AY02RFR82645<\/vehicle_id>/);
    assert.match(xml, /<availability>AVAILABLE<\/availability>/);
    assert.match(xml, /<state_of_vehicle>Used<\/state_of_vehicle>/);
    assert.match(xml, /<unit>MI<\/unit>/);
    assert.match(xml, /<body_style>SEDAN<\/body_style>/);
    assert.match(xml, /<component name="city">Yonkers<\/component>/);
    assert.match(xml, /<component name="addr1">1980 Central Park Ave<\/component>/);
    assert.match(xml, /<url>https:\/\/www.centralavemotors.com\/inventory\/2024-bmw-m3-wbs63ay02rfr82645<\/url>/);
  });
});

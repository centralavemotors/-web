import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAdfLead, nationalPhone } from "./adf";
import { decideLead } from "./validate";

const now = new Date("2026-10-18T17:04:00.000Z");

function allow() {
  return true;
}

describe("buildAdfLead", () => {
  it("escapes special characters and includes the ADF declaration", () => {
    const xml = buildAdfLead({
      id: "lead-1",
      date: now,
      pageUrl: "https://www.centralavemotors.com/inventory/example?q=a&b=c",
      customer: {
        fullName: "Tom & Jerry <script>",
        email: "tom@example.com",
        phone: "(914) 555-0100",
        comments: 'Asked for "the red one"',
      },
      vehicles: [
        {
          interest: "buy",
          status: "used",
          year: "2024",
          make: "BMW",
          model: "M3",
          vin: "WBS63AY02RFR82645",
          stock: "A&1",
          price: "117500",
          odometer: "25615",
          exteriorColor: "White",
        },
      ],
      vendorName: "Central Ave Motors",
      vendorPhone: "9142220156",
    });
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<\?adf version="1.0"\?>/);
    assert.equal(xml.includes("Tom &amp; Jerry &lt;script&gt;"), true);
    assert.equal(xml.includes("Tom & Jerry"), false);
    assert.equal(xml.includes("A&amp;1"), true);
    assert.match(xml, /<vin>WBS63AY02RFR82645<\/vin>/);
    assert.match(xml, /<phone type="voice">9145550100<\/phone>/);
    assert.match(xml, /<requestdate>2026-10-18T17:04:00Z<\/requestdate>/);
    assert.equal(xml.includes("&amp;b=c") || xml.includes("&amp;amp;"), true);
    assert.equal(nationalPhone("+1 (914) 222-0156"), "9142220156");
  });
});

describe("decideLead", () => {
  const base = {
    now,
    ip: "127.0.0.1",
    originOk: true,
    allow,
    id: "test-id",
  };

  it("rejects a bad origin and a rate limit", () => {
    assert.equal(decideLead({ intent: "contact", name: "Ada Lovelace", email: "ada@example.com" }, { ...base, originOk: false }).httpStatus, 403);
    assert.equal(
      decideLead({ intent: "contact", name: "Ada Lovelace", email: "ada@example.com" }, { ...base, allow: () => false }).httpStatus,
      429,
    );
  });

  it("drops honeypot submissions without an ADF payload", () => {
    const decision = decideLead(
      { intent: "contact", name: "Ada Lovelace", email: "ada@example.com", company_url: "https://spam.test" },
      base,
    );
    assert.equal(decision.httpStatus, 200);
    assert.equal(decision.deliver, undefined);
  });

  it("requires a name and a way to reply", () => {
    const decision = decideLead({ intent: "contact", name: "A", email: "not-an-email" }, base);
    assert.equal(decision.httpStatus, 400);
    assert.equal(decision.body.ok, false);
  });

  it("builds a test-drive lead with VIN, page URL, and UTM source", () => {
    const decision = decideLead(
      {
        intent: "test_drive",
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "9145550199",
        vin: "WBS63AY02RFR82645",
        year: "2024",
        make: "BMW",
        model: "M3",
        trim: "CS Sedan",
        price: "117500",
        pageUrl: "https://www.centralavemotors.com/inventory/2024-bmw-m3-wbs63ay02rfr82645",
        utmSource: "google",
        utmMedium: "cpc",
        preferredDate: "2026-10-21",
        message: "Morning, please.",
      },
      base,
    );
    assert.equal(decision.httpStatus, 200);
    const xml = decision.deliver?.xml ?? "";
    assert.match(xml, /interest="test-drive"/);
    assert.match(xml, /<vin>WBS63AY02RFR82645<\/vin>/);
    assert.match(xml, /Lead type: test_drive/);
    assert.match(xml, /UTM source: google/);
    assert.match(xml, /UTM medium: cpc/);
    assert.match(xml, /Preferred date: 2026-10-21/);
    assert.match(xml, /centralavemotors.com\/inventory\/2024-bmw-m3-wbs63ay02rfr82645/);
    assert.match(decision.deliver?.subject ?? "", /Test drive/);
    assert.equal(xml.includes("<stock>"), false);
  });

  it("includes the trade and the vehicle being considered", () => {
    const decision = decideLead(
      {
        intent: "trade_in",
        name: "Grace Hopper",
        phone: "9145550101",
        tradeYear: "2018",
        tradeMake: "Honda",
        tradeModel: "Accord",
        tradeMiles: "40,000",
        vin: "W1K6G8CB6RA296169",
        year: "2024",
        make: "Mercedes-Benz",
        model: "S-Class",
      },
      base,
    );
    const xml = decision.deliver?.xml ?? "";
    assert.match(xml, /interest="trade-in"/);
    assert.match(xml, /<make>Honda<\/make>/);
    assert.match(xml, /<odometer units="mi">40000<\/odometer>/);
    assert.match(xml, /interest="buy"/);
    assert.match(xml, /<vin>W1K6G8CB6RA296169<\/vin>/);
  });

  it("omits a vehicle block on a general contact", () => {
    const decision = decideLead(
      { intent: "contact", name: "Ada Lovelace", email: "ada@example.com", message: "What are your hours?" },
      base,
    );
    assert.equal(decision.deliver?.xml.includes("<vehicle"), false);
    assert.match(decision.deliver?.xml ?? "", /Lead type: contact/);
  });
});

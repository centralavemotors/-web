import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { businessHours, dealerFee, feedsEnabled, headlinePrice, headlinePriceMode, phone, PRICING_COPY, PRICING_DISCLAIMER } from "./site";

function filesIn(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...filesIn(full));
    else if (/\.(tsx?|css|json|svg|md)$/.test(entry) && !entry.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

describe("customer-facing compliance", () => {
  it("keeps one phone number and unconfirmed hours", () => {
    assert.equal(phone.display, "(914) 222-0156");
    assert.equal(phone.e164, "+19142220156");
    assert.equal(businessHours.confirmed, false);
    assert.match(businessHours.summary, /Placeholder/);
    assert.equal(dealerFee, 650);
    assert.equal(headlinePriceMode, "list");
    assert.equal(headlinePrice(1000), 1000);
    assert.equal(feedsEnabled(), true);
    assert.equal(PRICING_COPY.disclaimer, "Price excludes sales tax and NYS DMV title and registration fees.");
    assert.equal(PRICING_DISCLAIMER.short, PRICING_COPY.disclaimer);
    assert.equal(PRICING_DISCLAIMER.full, PRICING_COPY.disclaimer);
    assert.equal(PRICING_COPY.disclaimer.includes("PENDING COMPLIANCE REVIEW"), false);
  });

  it("does not mention retired brand names or the unconfirmed phone in the UI", () => {
    const roots = ["app", "components"];
    const forbidden = [
      /driveyonkers/i,
      /yonkers auto gallery/i,
      /yonkersautogallery/i,
      /775-8019/,
      /7758019/,
      /includes our charges/i,
      /includes dealer charges/i,
      /advertised prices include/i,
      /dealer charges are included/i,
      /include all charges/i,
    ];
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of filesIn(root)) {
        const text = readFileSync(file, "utf8");
        for (const pattern of forbidden) {
          if (pattern.test(text)) offenders.push(`${file} matched ${pattern}`);
        }
      }
    }
    assert.deepEqual(offenders, []);
  });

  it("uses one pricing sentence and no fee claims", () => {
    const forbidden = [
      /every advertised price includes our charges/i,
      /doc(?:umentation)?[\s-]+fees?/i,
      /no hidden fees/i,
      /processing[\s-]+fees?/i,
      /\$650/,
    ];
    const files = ["app", "components", "lib", "data"].flatMap((root) => filesIn(root)).concat("README.md", ".env.example");
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        if (pattern.test(text)) offenders.push(`${file} matched ${pattern}`);
      }
    }
    assert.deepEqual(offenders, []);
    for (const file of ["app/legal/page.tsx", "app/terms/page.tsx", "app/privacy/page.tsx", "app/accessibility/page.tsx"]) {
      assert.match(readFileSync(file, "utf8"), /placeholder|Draft/);
    }
  });

  it("uses the configured phone wherever a phone number is shown", () => {
    const phonePattern = /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g;
    const offenders: string[] = [];
    for (const file of [...filesIn("app"), ...filesIn("components"), "lib/site.ts"]) {
      const text = readFileSync(file, "utf8");
      const matches = text.match(phonePattern) ?? [];
      for (const match of matches) {
        const digits = match.replace(/\D/g, "");
        if (digits !== "9142220156") offenders.push(`${file}: ${match}`);
      }
    }
    assert.deepEqual(offenders, []);
  });
});

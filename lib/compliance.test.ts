import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { businessHours, phone, PRICING_DISCLAIMER } from "./site";

function filesIn(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...filesIn(full));
    else if (/\.(tsx?|css|json|svg|md)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("customer-facing compliance", () => {
  it("keeps one phone number and unconfirmed hours", () => {
    assert.equal(phone.display, "(914) 222-0156");
    assert.equal(phone.e164, "+19142220156");
    assert.equal(businessHours.confirmed, false);
    assert.match(businessHours.summary, /Placeholder/);
    assert.match(PRICING_DISCLAIMER.short, /DMV/);
    assert.match(PRICING_DISCLAIMER.full, /not a credit offer/);
    assert.ok(PRICING_DISCLAIMER.full.length > PRICING_DISCLAIMER.short.length);
  });

  it("does not mention retired brand names or the unconfirmed phone in the UI", () => {
    const roots = ["app", "components"];
    const forbidden = [/driveyonkers/i, /yonkers auto gallery/i, /yonkersautogallery/i, /775-8019/, /7758019/];
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

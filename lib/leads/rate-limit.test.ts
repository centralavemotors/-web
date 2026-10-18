import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { originAllowed } from "./http";
import { createRateLimiter } from "./rate-limit";

describe("rate limit and origin", () => {
  it("allows a burst and then blocks", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    const start = new Date("2026-10-18T12:00:00Z");
    assert.equal(allow("1.1.1.1", start), true);
    assert.equal(allow("1.1.1.1", new Date(start.getTime() + 10)), true);
    assert.equal(allow("1.1.1.1", new Date(start.getTime() + 20)), false);
    assert.equal(allow("1.1.1.1", new Date(start.getTime() + 1001)), true);
  });

  it("accepts a missing origin and rejects a mismatched host", () => {
    assert.equal(originAllowed(new Request("https://www.centralavemotors.com/api/leads")), true);
    const bad = new Request("https://www.centralavemotors.com/api/leads", {
      headers: { origin: "https://evil.example", host: "www.centralavemotors.com" },
    });
    assert.equal(originAllowed(bad), false);
    const good = new Request("https://www.centralavemotors.com/api/leads", {
      headers: { origin: "https://www.centralavemotors.com", host: "www.centralavemotors.com" },
    });
    assert.equal(originAllowed(good), true);
  });
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { normalizeVehicle } from "./inventory/normalize";
import type { RawVehicle } from "./inventory/types";

const seed = JSON.parse(readFileSync("data/inventory.seed.json", "utf8")) as RawVehicle[];
const map = JSON.parse(readFileSync("redirects/cutover.map.json", "utf8")) as {
  source: string;
  destination: string;
  permanent: boolean;
}[];

describe("cutover redirects", () => {
  it("sends every previous vehicle path to the new VIN slug", () => {
    const bySource = new Map(map.map((entry) => [entry.source, entry.destination]));
    assert.equal(map.every((entry) => entry.permanent), true);
    for (const row of seed) {
      assert.ok(row.url);
      const vehicle = normalizeVehicle(row);
      assert.ok(vehicle);
      const encoded = new URL(row.url).pathname;
      const decoded = decodeURIComponent(encoded);
      assert.equal(bySource.get(decoded), `/inventory/${vehicle.slug}`);
      assert.equal(bySource.get(encoded), `/inventory/${vehicle.slug}`);
    }
  });
});

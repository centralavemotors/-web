import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { normalizeVehicle } from "./normalize";
import type { RawVehicle } from "./types";

const seed = JSON.parse(readFileSync("data/inventory.seed.json", "utf8")) as RawVehicle[];

describe("normalizeVehicle", () => {
  it("parses price, miles, slug, and a single photo", () => {
    const vehicle = normalizeVehicle({
      year: "2024",
      make: "Mercedes-Benz",
      model: "S-Class",
      trim: "AMG S 63 E 4MATIC Sedan",
      miles: "32,445 miles",
      price: "134595",
      img: "https://images.autofunds.net/example.jpg",
      images: ["https://images.autofunds.net/example.jpg", "https://images.autofunds.net/two.jpg"],
      url: "https://www.centralavemotors.com/old/used_car/abc%3d",
      body: null,
      vin: "w1k6g8cb6ra296169",
      color: "Black",
    });
    assert.ok(vehicle);
    assert.equal(vehicle.price, 134595);
    assert.equal(vehicle.miles, 32445);
    assert.equal(vehicle.vin, "W1K6G8CB6RA296169");
    assert.equal(vehicle.body, "Sedan");
    assert.equal(vehicle.bodyDerived, true);
    assert.equal(vehicle.slug, "2024-mercedes-benz-s-class-w1k6g8cb6ra296169");
    assert.equal(vehicle.photos.length, 2);
    assert.equal(vehicle.legacyPath, "/old/used_car/abc=");
  });

  it("keeps a provided body style", () => {
    const vehicle = normalizeVehicle({
      year: 2020,
      make: "BMW",
      model: "X5",
      miles: 1000,
      price: 50000,
      vin: "5YM23ET06S9X78723",
      body: "SUV",
    });
    assert.equal(vehicle?.body, "SUV");
    assert.equal(vehicle?.bodyDerived, false);
  });

  it("drops rows without a usable VIN or price", () => {
    assert.equal(normalizeVehicle({ year: 2020, make: "BMW", model: "X5", miles: 1, price: 10, vin: "SHORT" }), null);
    assert.equal(
      normalizeVehicle({ year: 2020, make: "BMW", model: "X5", miles: 1, price: "Call", vin: "WBA12345678901234" }),
      null,
    );
  });

  it("classifies every seed vehicle and keeps slugs unique", () => {
    const vehicles = seed.map((row) => normalizeVehicle(row));
    assert.equal(vehicles.every(Boolean), true);
    const styles = new Map<string, number>();
    const slugs = new Set<string>();
    for (const vehicle of vehicles) {
      assert.ok(vehicle);
      styles.set(vehicle.body, (styles.get(vehicle.body) ?? 0) + 1);
      assert.equal(vehicle.body === "Other", false, `${vehicle.vin} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`);
      assert.equal(slugs.has(vehicle.slug), false);
      slugs.add(vehicle.slug);
      assert.equal(vehicle.photos.length, 1);
    }
    assert.equal(slugs.size, 99);
    assert.ok((styles.get("SUV") ?? 0) > 20);
    assert.ok((styles.get("Coupe") ?? 0) > 5);
    assert.ok((styles.get("Truck") ?? 0) >= 3);
  });
});

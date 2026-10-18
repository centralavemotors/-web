import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyInventoryQuery,
  matches,
  pageWindow,
  parseInventoryQuery,
  toInventorySearch,
  type Filterable,
} from "./filter";

const cars: Filterable[] = [
  { make: "BMW", model: "M3", body: "Sedan", year: 2024, price: 80000, miles: 12000, vin: "B", trim: "Competition", color: "Black" },
  { make: "Porsche", model: "911", body: "Coupe", year: 2014, price: 124505, miles: 30800, vin: "P", trim: "GT3" },
  { make: "GMC", model: "Sierra 1500", body: "Truck", year: 2022, price: 45000, miles: 40000, vin: "G" },
];

describe("inventory query", () => {
  it("filters by make, price, and compact search", () => {
    const query = parseInventoryQuery({ make: "BMW", maxPrice: "90000", q: "m3" });
    assert.equal(query.sort, "price-desc");
    assert.deepEqual(
      cars.filter((car) => matches(car, query)).map((car) => car.vin),
      ["B"],
    );
  });

  it("matches a search token that ignores spaces", () => {
    const query = parseInventoryQuery({ q: "gt3" });
    assert.equal(cars.filter((car) => matches(car, query)).length, 1);
  });

  it("sorts and paginates", () => {
    const result = applyInventoryQuery(cars, parseInventoryQuery({ sort: "price-asc", page: "1" }));
    assert.deepEqual(result.items.map((car) => car.vin), ["G", "B", "P"]);
    const second = applyInventoryQuery(cars, { ...parseInventoryQuery({}), page: 9 });
    assert.equal(second.page, 1);
    assert.equal(second.pageCount, 1);
  });

  it("omits the default sort from the query string", () => {
    const href = toInventorySearch(parseInventoryQuery({ make: "Audi" }));
    assert.equal(href, "?make=Audi");
  });

  it("windows page numbers", () => {
    assert.deepEqual(pageWindow(5, 9), [1, "gap", 4, 5, 6, "gap", 9]);
  });
});

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics";
import type { Catalog } from "@/lib/inventory/catalog";
import { PRICE_STOPS } from "@/lib/inventory/filter";
import { formatPrice } from "@/lib/format";

const selectClass =
  "cam-select cam-select-light h-12 w-full border border-black/15 bg-white px-3 text-base text-[#1c1b18]";

export function QuickSearch({ catalog }: { catalog: Catalog }) {
  const [make, setMake] = useState("");
  const models = make ? catalog.modelsByMake[make] ?? [] : [];

  return (
    <form
      action="/inventory"
      method="get"
      aria-label="Search inventory"
      className="grid gap-4 bg-[#f3f2ee] p-5 text-[#1c1b18] md:grid-cols-4 md:items-end md:p-6"
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        const query = ["make", "model", "maxPrice"]
          .map((key) => String(data.get(key) ?? ""))
          .filter(Boolean)
          .join(" ");
        track({ name: "search", payload: { query: query || "all" } });
        for (const element of Array.from(event.currentTarget.elements)) {
          if (element instanceof HTMLSelectElement && element.value.trim() === "") element.disabled = true;
        }
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="home-make">Make</Label>
        <select
          id="home-make"
          name="make"
          className={selectClass}
          value={make}
          onChange={(event) => setMake(event.target.value)}
        >
          <option value="">Any make</option>
          {catalog.makes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="home-model">Model</Label>
        <select id="home-model" name="model" className={selectClass} defaultValue="">
          <option value="">Any model</option>
          {(make ? models : Object.values(catalog.modelsByMake).flat()).map((item) => (
            <option key={`${make}-${item}`} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="home-price">Max price</Label>
        <select id="home-price" name="maxPrice" className={selectClass} defaultValue="">
          <option value="">Any price</option>
          {PRICE_STOPS.map((stop) => (
            <option key={stop} value={stop}>
              Up to {formatPrice(stop)}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="h-12">
        Search
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { track } from "@/lib/analytics";
import type { Catalog } from "@/lib/inventory/catalog";
import {
  MILEAGE_STOPS,
  PRICE_STOPS,
  SORT_OPTIONS,
  matches,
  parseInventoryQuery,
  toParamRecord,
  type InventoryIndexItem,
  type InventoryQuery,
} from "@/lib/inventory/filter";
import { formatMiles, formatPrice } from "@/lib/format";

const selectClass =
  "cam-select h-12 w-full border border-white/20 bg-[#171714] px-3 text-base text-[#f6f4ef]";

function omitBlankFields(event: React.FormEvent<HTMLFormElement>) {
  for (const element of Array.from(event.currentTarget.elements)) {
    if (
      !(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)
    ) {
      continue;
    }
    if (element.name && element.value.trim() === "") element.disabled = true;
  }
}

function HiddenFields({ query, omit }: { query: InventoryQuery; omit: string[] }) {
  return Object.entries(toParamRecord(query)).map(([key, value]) =>
    omit.includes(key) ? null : <input key={key} type="hidden" name={key} value={value} />,
  );
}

function FilterFields({
  query,
  catalog,
  instant,
  onDraft,
}: {
  query: InventoryQuery;
  catalog: Catalog;
  instant: boolean;
  onDraft?: (form: HTMLFormElement) => void;
}) {
  const [make, setMake] = useState(query.make ?? "");
  const years = [];
  for (let year = catalog.maxYear; year >= catalog.minYear; year -= 1) years.push(year);
  const models = make ? catalog.modelsByMake[make] ?? [] : null;

  function onSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const form = event.currentTarget.form;
    if (!form) return;
    if (event.currentTarget.name === "make") {
      const nextMake = event.currentTarget.value;
      setMake(nextMake);
      const model = form.elements.namedItem("model");
      if (model instanceof HTMLSelectElement) model.value = "";
    }
    track({
      name: "filter_use",
      payload: { filter: event.currentTarget.name, value: event.currentTarget.value || "any" },
    });
    if (instant) form.requestSubmit();
    else onDraft?.(form);
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm">
        Search
        <input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Model, color, VIN"
          className="h-12 w-full border border-white/20 bg-[#171714] px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#f6f4ef]"
          onChange={(event) => {
            if (!instant && event.currentTarget.form) onDraft?.(event.currentTarget.form);
          }}
        />
      </label>
      <label className="grid gap-2 text-sm">
        Make
        <select name="make" className={selectClass} defaultValue={query.make ?? ""} onChange={onSelect}>
          <option value="">Any make</option>
          {catalog.makes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Model
        <select
          name="model"
          key={make}
          className={selectClass}
          defaultValue={make === (query.make ?? "") ? query.model ?? "" : ""}
          onChange={onSelect}
        >
          <option value="">Any model</option>
          {models
            ? models.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))
            : catalog.makes.flatMap((item) =>
                (catalog.modelsByMake[item] ?? []).map((model) => (
                  <option key={`${item}-${model}`} value={model}>
                    {item} {model}
                  </option>
                )),
              )}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Body style
        <select name="body" className={selectClass} defaultValue={query.body ?? ""} onChange={onSelect}>
          <option value="">Any body</option>
          {catalog.bodies.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2 text-sm">
          From year
          <select name="minYear" className={selectClass} defaultValue={query.minYear ?? ""} onChange={onSelect}>
            <option value="">Any</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Through year
          <select name="maxYear" className={selectClass} defaultValue={query.maxYear ?? ""} onChange={onSelect}>
            <option value="">Any</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Max price
        <select name="maxPrice" className={selectClass} defaultValue={query.maxPrice ?? ""} onChange={onSelect}>
          <option value="">Any price</option>
          {PRICE_STOPS.map((stop) => (
            <option key={stop} value={stop}>
              Up to {formatPrice(stop)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Max mileage
        <select name="maxMiles" className={selectClass} defaultValue={query.maxMiles ?? ""} onChange={onSelect}>
          <option value="">Any mileage</option>
          {MILEAGE_STOPS.map((stop) => (
            <option key={stop} value={stop}>
              Up to {formatMiles(stop)}
            </option>
          ))}
        </select>
      </label>
      <HiddenFields query={query} omit={["make", "model", "body", "minYear", "maxYear", "maxPrice", "maxMiles", "q", "page"]} />
    </div>
  );
}

export function InventoryControls({
  query,
  catalog,
  index,
  total,
}: {
  query: InventoryQuery;
  catalog: Catalog;
  index: InventoryIndexItem[];
  total: number;
}) {
  const [count, setCount] = useState(total);
  const active = Object.keys(toParamRecord(query)).filter((key) => key !== "sort" && key !== "page").length;

  function recount(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === "string") params.set(key, value);
    }
    const next = parseInventoryQuery(params);
    setCount(index.filter((item) => matches(item, next)).length);
  }

  return (
    <div>
      <Sheet>
        <SheetTrigger className={buttonVariants({ variant: "outline", className: "h-12 w-full lg:hidden" })}>
          Filters{active ? ` (${active})` : ""}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[min(88svh,760px)] rounded-t-2xl p-0">
          <SheetHeader>
            <SheetTitle className="font-display text-3xl">Filters</SheetTitle>
          </SheetHeader>
          <form
            action="/inventory#results"
            method="get"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={omitBlankFields}
            onChange={(event) => recount(event.currentTarget)}
          >
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <FilterFields query={query} catalog={catalog} instant={false} onDraft={recount} />
            </div>
            <SheetFooter className="border-t border-white/10">
              <button type="submit" className={buttonVariants({ className: "h-12 w-full" })}>
                Show {count} vehicles
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <form
        action="/inventory#results"
        method="get"
        className="mt-8 hidden lg:mt-0 lg:block"
        onSubmit={(event) => {
          const queryText = String(new FormData(event.currentTarget).get("q") ?? "");
          if (queryText) track({ name: "search", payload: { query: queryText } });
          omitBlankFields(event);
        }}
      >
        <FilterFields query={query} catalog={catalog} instant />
        <button type="submit" className={buttonVariants({ className: "mt-4 h-12 w-full" })}>
          Search
        </button>
      </form>
    </div>
  );
}

export function SortSelect({ query }: { query: InventoryQuery }) {
  const hidden = toParamRecord({ ...query, sort: "price-desc", page: 1 });
  delete hidden.sort;
  delete hidden.page;
  return (
    <form action="/inventory#results" method="get" className="flex items-center gap-3" onSubmit={omitBlankFields}>
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label htmlFor="inventory-sort" className="text-sm text-[#c9c3b6]">
        Sort
      </label>
      <select
        id="inventory-sort"
        name="sort"
        defaultValue={query.sort}
        className="cam-select h-12 border border-white/20 bg-[#171714] px-3 text-base"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}

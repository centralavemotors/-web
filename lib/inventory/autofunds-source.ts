import "server-only";
import type { InventorySource } from "./types";

/**
 * Placeholder for the AutoFunds inventory feed.
 *
 * The feed method is not confirmed yet. When AutoFunds provides a URL, set
 * INVENTORY_SOURCE=autofunds and AUTOFUNDS_FEED_URL. Parse the XML or CSV in
 * `load()`, map each row through `normalizeVehicle`, and return vehicles that
 * disappeared as sold only after that behavior is specified.
 *
 * Fetch with Next.js revalidation so ISR refreshes vehicle pages:
 *   await fetch(url, { next: { revalidate: 3600 } })
 */
export const autoFundsInventorySource: InventorySource = {
  id: "autofunds",
  async load() {
    const url = process.env.AUTOFUNDS_FEED_URL;
    if (!url) {
      throw new Error(
        "INVENTORY_SOURCE=autofunds requires AUTOFUNDS_FEED_URL. The feed format is still to be confirmed.",
      );
    }
    throw new Error(
      "The AutoFunds feed parser is not implemented yet. Confirm whether the feed is XML or CSV, then map rows with normalizeVehicle.",
    );
  },
};

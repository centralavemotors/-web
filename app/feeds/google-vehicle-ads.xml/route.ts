import { buildGoogleVehicleFeed } from "@/lib/feeds/google";
import { getInventory } from "@/lib/inventory";
import { absoluteUrl, feedsEnabled, siteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  if (!feedsEnabled()) {
    return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const snapshot = await getInventory();
  const storeCode = process.env.GOOGLE_STORE_CODE?.trim() || "CAM-YONKERS";
  const xml = buildGoogleVehicleFeed(snapshot.vehicles, {
    siteUrl: siteUrl(),
    storeCode,
    linkFor: (vehicle) => absoluteUrl(`/inventory/${vehicle.slug}`),
  });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

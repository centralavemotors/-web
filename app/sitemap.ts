import type { MetadataRoute } from "next";
import { getInventory } from "@/lib/inventory";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getInventory();
  const lastModified = snapshot.updatedAt ? new Date(`${snapshot.updatedAt}T00:00:00Z`) : undefined;
  const paths = ["/", "/inventory", "/financing", "/sell", "/faq", "/contact", "/legal", "/privacy", "/terms", "/accessibility"];
  return [
    ...paths.map((path) => ({ url: absoluteUrl(path), lastModified })),
    ...snapshot.vehicles.map((vehicle) => ({
      url: absoluteUrl(`/inventory/${vehicle.slug}`),
      lastModified,
    })),
  ];
}

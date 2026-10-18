import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (process.env.ROBOTS_INDEX !== "true") {
    return {
      rules: [
        { userAgent: "*", disallow: "/" },
        { userAgent: "*", allow: "/feeds/" },
      ],
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}

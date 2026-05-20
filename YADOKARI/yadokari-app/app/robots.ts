import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config";

const BASE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/favorites/", "/dashboard/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

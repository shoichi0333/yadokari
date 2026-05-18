import { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yadokari.jp").replace(/^﻿/, "").replace(/\/$/, "");

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

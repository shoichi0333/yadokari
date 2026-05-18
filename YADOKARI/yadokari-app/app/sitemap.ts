import { MetadataRoute } from "next";
import { WARD_ZONING_MAP } from "@/lib/data/wardZoning";
import { BLOG_POSTS } from "@/lib/data/blogPosts";
import { PROPERTIES } from "@/lib/data/properties";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yadokari.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const prefectures = [...new Set(WARD_ZONING_MAP.map((w) => w.prefecture))];

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/check`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/map`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/properties`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/area`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/submit-property`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const areaPages: MetadataRoute.Sitemap = prefectures.map((p) => ({
    url: `${BASE_URL}/area/${encodeURIComponent(p)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const wardPages: MetadataRoute.Sitemap = WARD_ZONING_MAP.map((w) => ({
    url: `${BASE_URL}/area/${encodeURIComponent(w.prefecture)}/${encodeURIComponent(w.ward)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const propertyPages: MetadataRoute.Sitemap = PROPERTIES.map((p) => ({
    url: `${BASE_URL}/property/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...areaPages, ...wardPages, ...blogPages, ...propertyPages];
}

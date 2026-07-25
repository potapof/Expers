import { MetadataRoute } from "next";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllPublishedArticles,
  type Article,
} from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";

const BASE = "https://expers.ru";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/contacts`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/offer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/refund`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
];

function articleToEntry(a: Article): MetadataRoute.Sitemap[number] {
  const industry = a.industryName || a.industryId;
  const slug = a.slug || a.id;
  const url = `${BASE}/${encodeURIComponent(industry)}/${encodeURIComponent(slug)}`;
  return {
    url,
    lastModified: new Date(a.updatedAt || a.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [...STATIC_PAGES];

  try {
    const dbAvailable = await isDatabaseAvailable();
    const articles: Article[] = dbAvailable
      ? await getAllPublishedArticles()
      : mockArticles.filter((a) => a.status === "published");

    for (const article of articles) {
      entries.push(articleToEntry(article));
    }
  } catch {
    // Fallback: static pages only
  }

  return entries;
}

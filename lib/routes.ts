import { getIndustrySlug } from "./industry-slugs";

export function articleUrl(article: {
  id: string;
  slug?: string;
  industryId: string;
}): string {
  const industrySlug = getIndustrySlug(article.industryId);
  const slug = article.slug ?? article.id;
  return `/${industrySlug}/${slug}`;
}

import { CatalogClient } from "@/components/catalog-client";
import { getCatalogArticles } from "@/lib/article-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getCatalogArticles();
  return <CatalogClient articles={articles} />;
}

import { CatalogClient } from "@/components/catalog-client";
import { getCatalogArticles } from "@/lib/article-view";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const articles = await getCatalogArticles();
  return <CatalogClient articles={articles} />;
}

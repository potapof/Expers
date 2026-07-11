import { notFound } from "next/navigation";
import { getExpertProfileById, getArticlesByExpertId } from "@/lib/data";
import ExpertProfileClient from "@/components/expert-profile-client";

export default async function ExpertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = getExpertProfileById(id);

  if (!expert) {
    notFound();
  }

  const expertArticles = getArticlesByExpertId(id);

  return (
    <ExpertProfileClient
      expertId={id}
      staticExpert={expert}
      staticArticles={expertArticles}
    />
  );
}

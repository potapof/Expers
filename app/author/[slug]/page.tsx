import { notFound } from "next/navigation";
import { getAuthorPageBySlug } from "@/lib/models";
import { AuthorPagePublic } from "@/components/author-page-public";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expert = await getAuthorPageBySlug(slug);
  if (!expert) notFound();

  return <AuthorPagePublic expert={expert} />;
}

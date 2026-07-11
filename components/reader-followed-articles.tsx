"use client";

import { useSubscriptions } from "@/lib/use-subscriptions";
import { getAllReaderArticles } from "@/lib/reader-data";
import { ArticleCard } from "@/components/article-card";
import { Bookmark } from "lucide-react";

export function ReaderFollowedArticles() {
  const { subscriptions, subscribedCount } = useSubscriptions();

  const allArticles = getAllReaderArticles();
  const followedArticles = allArticles.filter((a) =>
    subscriptions.has(a.authorId)
  );

  if (subscribedCount === 0 || followedArticles.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Bookmark className="h-4 w-4 text-[#1ABC9C]" />
        <h3 className="text-base font-semibold text-[#2C3E50]">
          Статьи от подписанных авторов
        </h3>
      </div>
      <p className="mb-4 text-sm text-gray-400">
        Новые публикации авторов, на которых вы подписаны
      </p>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {followedArticles.slice(0, 6).map((article) => (
          <ArticleCard key={article.id} article={article} viewMode="grid" />
        ))}
      </div>
    </div>
  );
}

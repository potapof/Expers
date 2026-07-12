import Link from "next/link";
import type { ReaderArticle } from "@/lib/reader-data";
import { Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/favorite-button";
import { articleUrl } from "@/lib/routes";

export type ViewMode = "grid" | "list" | "compact";

function getArticleUrl(article: ReaderArticle) {
  return articleUrl(article);
}

export function ArticleCard({
  article,
  viewMode,
}: {
  article: ReaderArticle;
  viewMode: ViewMode;
}) {
  const href = getArticleUrl(article);

  if (viewMode === "compact") {
    return (
      <Link
        href={href}
        className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-[#2C3E50]">
            {article.title}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {article.date}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton articleId={article.id} />
          <span className="shrink-0 text-xs text-gray-400">
            {article.readTime}
          </span>
        </div>
      </Link>
    );
  }

  if (viewMode === "list") {
    return (
      <Link
        href={href}
        className="flex gap-5 rounded-xl border border-gray-100 p-5 transition-colors hover:border-gray-200 hover:bg-gray-50"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <span className="text-lg font-bold text-[#3498DB]">
            {article.title.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1">
            <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#3498DB]">
              {article.industryName}
            </span>
          </div>
          <h3 className="text-base font-semibold text-[#2C3E50]">
            {article.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {article.description}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
          </div>
        </div>
        <FavoriteButton articleId={article.id} className="self-start mt-1" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-sm"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#3498DB]">
          {article.industryName}
        </span>
        <div className="flex items-center gap-2">
          <FavoriteButton articleId={article.id} />
          <span className="text-xs text-gray-400">{article.readTime}</span>
        </div>
      </div>
      <h3 className="mb-2 text-base font-semibold leading-snug text-[#2C3E50] group-hover:text-[#3498DB]">
        {article.title}
      </h3>
      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
        {article.description}
      </p>
      <div className="flex items-center gap-3 border-t border-gray-50 pt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {article.authorName}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {article.date}
        </span>
      </div>
    </Link>
  );
}

export function ArticleCardSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "compact") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 flex gap-3">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex gap-5 rounded-xl border border-gray-100 p-5">
        <div className="h-14 w-14 animate-pulse rounded-lg bg-gray-100" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-5 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="mb-1 h-5 w-full animate-pulse rounded bg-gray-100" />
          <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 flex gap-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
        <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mb-2 h-5 w-full animate-pulse rounded bg-gray-100" />
      <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-100" />
      <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

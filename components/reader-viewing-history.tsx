"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useViewingHistory } from "@/lib/use-viewing-history";
import { getAllReaderArticles } from "@/lib/reader-data";
import { Clock, Trash2, History } from "lucide-react";

export function ReaderViewingHistory() {
  const { history, clearHistory } = useViewingHistory();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const articlesMap = useMemo(() => {
    const map = new Map(getAllReaderArticles().map((a) => [a.id, a]));
    return map;
  }, []);

  const entries = useMemo(() => {
    return history.filter((e) => articlesMap.has(e.articleId)).slice(0, 10);
  }, [history, articlesMap]);

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Только что";
    if (diffMin < 60) return `${diffMin} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <History className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">История просмотров пуста</p>
        <p className="mt-1 text-xs text-gray-400">
          Статьи, которые вы откроете, появятся здесь
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">Последние просмотренные статьи</p>
        <button
          type="button"
          onClick={clearHistory}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Очистить
        </button>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => {
          const article = articlesMap.get(entry.articleId);
          if (!article) return null;
          return (
            <Link
              key={entry.articleId + entry.viewedAt}
              href={`/articles/${entry.articleId}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-[#2C3E50]">
                  {article.title}
                </h4>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  <span>{article.authorName}</span>
                  <span className="text-gray-200">·</span>
                  <span>{article.industryName}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatDate(entry.viewedAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

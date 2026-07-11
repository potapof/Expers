"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { useFavorites } from "@/lib/use-favorites";
import { getAllReaderArticles } from "@/lib/reader-data";
import type { ViewMode } from "@/components/article-card";
import { cn } from "@/lib/utils";

const VIEW_STORAGE_KEY = "expers-cabinet-view";
const ARTICLES_PER_PAGE = 12;

export default function FavoriteArticlesPage() {
  const { expert, loading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode | null;
    if (saved === "grid" || saved === "list" || saved === "compact")
      return saved;
    return "grid";
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { favorites } = useFavorites();

  useEffect(() => {
    if (!loading && !expert) {
      router.replace("/");
    }
  }, [loading, expert, router]);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const allArticles = getAllReaderArticles();
  const favoriteArticles = allArticles.filter((a) => favorites.has(a.id));
  const totalPages = Math.ceil(favoriteArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const pageArticles = favoriteArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE
  );

  if (loading || !expert) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cabinet">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#2C3E50]">
              Избранные статьи
            </h1>
            <p className="text-sm text-gray-400">
              {favoriteArticles.length} статей в избранном
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(
            [
              { key: "grid", label: "3 в ряд" },
              { key: "list", label: "Список" },
              { key: "compact", label: "Компактная" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === key
                  ? "bg-[#3498DB] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <ArticleGridSkeleton viewMode={viewMode} count={ARTICLES_PER_PAGE} />
      ) : (
        <>
          {favoriteArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Heart className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Нет избранных статей</p>
              <p className="mt-1 text-xs text-gray-400">
                Нажмите на сердечко на любой статье, чтобы добавить её в
                избранное
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pageArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="mb-8 space-y-3">
                  {pageArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-[#2C3E50] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            "h-8 w-8 rounded-md text-sm font-medium transition-colors",
            p === page
              ? "bg-[#3498DB] text-white"
              : "text-gray-500 hover:bg-gray-100"
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-[#2C3E50] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ArticleGridSkeleton({
  viewMode,
  count,
}: {
  viewMode: ViewMode;
  count: number;
}) {
  if (viewMode === "grid") {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ArticleCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}

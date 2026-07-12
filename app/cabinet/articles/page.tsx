"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { getAllReaderArticles } from "@/lib/reader-data";
import type { ViewMode } from "@/components/article-card";
import { cn } from "@/lib/utils";

const VIEW_STORAGE_KEY = "expers-cabinet-view";
const ARTICLES_PER_PAGE = 12;

export default function AllArticlesPage() {
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
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const pageArticles = allArticles.slice(
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
            <h1 className="text-xl font-bold text-[#2C3E50]">Все статьи</h1>
            <p className="text-sm text-gray-400">
              {allArticles.length} статей в каталоге
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
                  ? "bg-[#0039CA] text-white"
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
              ? "bg-[#0039CA] text-white"
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

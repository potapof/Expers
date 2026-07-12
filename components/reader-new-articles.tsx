import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  List,
  AlignJustify,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { SectionSelectorDialog } from "@/components/section-selector-dialog";
import { getAllReaderArticles } from "@/lib/reader-data";
import { useSectionSubscriptions } from "@/lib/use-section-subscriptions";
import type { ViewMode } from "@/components/article-card";
import { cn } from "@/lib/utils";

const VIEW_STORAGE_KEY = "expers-cabinet-view";

type SortMode = "date" | "popularity";

export function ReaderNewArticles() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode | null;
    if (saved === "grid" || saved === "list" || saved === "compact")
      return saved;
    return "grid";
  });
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { subscriptions, setSubscriptions, subscribedCount } =
    useSectionSubscriptions();

  useEffect(() => {
    if (subscribedCount === 0) {
      setSubscriptions(["media-entertainment"]);
    }
  }, [subscribedCount, setSubscriptions]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== VIEW_STORAGE_KEY) return;
      const saved = localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode | null;
      if (saved === "grid" || saved === "list" || saved === "compact") {
        setViewMode(saved);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const saveSections = useCallback(
    (ids: string[]) => {
      setSubscriptions(ids);
    },
    [setSubscriptions]
  );

  const allArticles = getAllReaderArticles();

  const filteredArticles = allArticles.filter((a) => {
    if (subscriptions.has(a.industryId)) return true;
    if (a.subsectionId && subscriptions.has(a.subsectionId)) return true;
    return false;
  });

  if (filteredArticles.length === 0) {
    const fallback = allArticles.filter(
      (a) => a.industryId === "media-entertainment"
    );
    const sortedFallback = [...fallback].sort((a, b) =>
      sortMode === "date"
        ? b.date.localeCompare(a.date)
        : a.title.localeCompare(b.title)
    );
    const displayArticles = sortedFallback.slice(0, 6);

    return (
      <div>
        <Sitebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortMode={sortMode}
          setSortMode={setSortMode}
          onOpenSections={() => setSectionDialogOpen(true)}
        />
        <SectionSelectorDialog
          open={sectionDialogOpen}
          onOpenChange={setSectionDialogOpen}
          selectedSections={[...subscriptions]}
          onSave={saveSections}
        />
        {loading ? (
          <ArticleGridSkeleton viewMode={viewMode} count={6} />
        ) : (
          <>
            {displayArticles.length > 0 ? (
              <ArticleList articles={displayArticles} viewMode={viewMode} />
            ) : (
              <EmptyState />
            )}
            <AllArticlesLink />
          </>
        )}
      </div>
    );
  }

  const sortedArticles = [...filteredArticles].sort((a, b) =>
    sortMode === "date"
      ? b.date.localeCompare(a.date)
      : a.title.localeCompare(b.title)
  );

  const displayArticles = sortedArticles.slice(0, 6);

  return (
    <div>
      <Sitebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortMode={sortMode}
        setSortMode={setSortMode}
        onOpenSections={() => setSectionDialogOpen(true)}
      />
      <SectionSelectorDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        selectedSections={[...subscriptions]}
        onSave={saveSections}
      />
      {loading ? (
        <ArticleGridSkeleton viewMode={viewMode} count={6} />
      ) : (
        <>
          <ArticleList articles={displayArticles} viewMode={viewMode} />
          <AllArticlesLink />
        </>
      )}
    </div>
  );
}

function Sitebar({
  viewMode,
  setViewMode,
  sortMode,
  setSortMode,
  onOpenSections,
}: {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
  onOpenSections: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            setSortMode(sortMode === "date" ? "popularity" : "date")
          }
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#2C3E50]"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortMode === "date" ? "По дате" : "По популярности"}
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1">
          {(
            [
              { key: "grid", icon: LayoutGrid },
              { key: "list", icon: List },
              { key: "compact", icon: AlignJustify },
            ] as const
          ).map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === key
                  ? "bg-[#0039CA] text-white"
                  : "text-gray-400 hover:text-[#2C3E50]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <div className="hidden h-4 w-px bg-gray-200 sm:block" />
        <button
          type="button"
          onClick={onOpenSections}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#2C3E50]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Выбор разделов
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Eye className="h-3 w-3" />
        <span>
          {viewMode === "grid"
            ? "3 в ряд"
            : viewMode === "list"
              ? "Список"
              : "Компактная"}
        </span>
      </div>
    </div>
  );
}

function ArticleList({
  articles,
  viewMode,
}: {
  articles: ReturnType<typeof getAllReaderArticles>;
  viewMode: ViewMode;
}) {
  if (viewMode === "grid") {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} viewMode={viewMode} />
      ))}
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ArticleCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Eye className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">Нет статей в выбранных разделах</p>
      <p className="mt-1 text-xs text-gray-400">
        Попробуйте изменить выбор разделов
      </p>
    </div>
  );
}

function AllArticlesLink() {
  return (
    <div className="flex justify-center">
      <Link href="/cabinet/articles">
        <Button variant="outline" size="sm">
          Все статьи
        </Button>
      </Link>
    </div>
  );
}

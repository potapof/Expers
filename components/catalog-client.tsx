"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { industries, getIndustryById } from "@/lib/data";
import type { CatalogArticle } from "@/lib/article-view";
import { articleUrl } from "@/lib/routes";
import {
  Building2,
  Landmark,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Car,
  Monitor,
  Home,
  Zap,
  Plane,
  Radio,
  Wheat,
  Leaf,
  ChevronDown,
  Clock,
  User,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { SubscribeSectionButton } from "@/components/subscribe-section-button";

const industryIcons: Record<string, React.ReactNode> = {
  manufacturing: <Building2 className="h-4 w-4" />,
  finance: <Landmark className="h-4 w-4" />,
  healthcare: <HeartPulse className="h-4 w-4" />,
  retail: <ShoppingBag className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  automotive: <Car className="h-4 w-4" />,
  "it-tech": <Monitor className="h-4 w-4" />,
  "real-estate": <Home className="h-4 w-4" />,
  energy: <Zap className="h-4 w-4" />,
  tourism: <Plane className="h-4 w-4" />,
  "media-entertainment": <Radio className="h-4 w-4" />,
  "agri-food": <Wheat className="h-4 w-4" />,
  "ecology-climate": <Leaf className="h-4 w-4" />,
};

function findCategoryParentIds(
  categoryId: string
): { industryId: string; subsectionId: string } | null {
  for (const ind of industries) {
    for (const sub of ind.subsections) {
      if (sub.categories.some((c) => c.id === categoryId)) {
        return { industryId: ind.id, subsectionId: sub.id };
      }
    }
  }
  return null;
}

export function CatalogClient({ articles }: { articles: CatalogArticle[] }) {
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const toggleIndustry = useCallback((id: string) => {
    setExpandedIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSubsection = useCallback((id: string) => {
    setExpandedSubsections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
    const parents = findCategoryParentIds(categoryId);
    if (parents) {
      setExpandedIndustries((prev) => {
        const next = new Set(prev);
        next.add(parents.industryId);
        return next;
      });
      setExpandedSubsections((prev) => {
        const next = new Set(prev);
        next.add(parents.subsectionId);
        return next;
      });
    }
  }, []);

  const allArticles = articles;
  const filteredArticles: CatalogArticle[] = selectedCategoryId
    ? allArticles.filter((a) => a.categoryId === selectedCategoryId)
    : allArticles;

  return (
    <div className="mx-auto px-4 max-w-7xl flex gap-8" suppressHydrationWarning>
      <aside className="w-72 shrink-0 hidden lg:block">
        <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pr-4">
          <div className="space-y-1">
            {industries.map((industry) => {
              const isExpanded = expandedIndustries.has(industry.id);
              return (
                <div key={industry.id}>
                  <button
                    onClick={() => toggleIndustry(industry.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-[#2C3E50] rounded-md hover:bg-gray-100 transition-colors text-left"
                  >
                    {industryIcons[industry.id]}
                    <span className="flex-1">{industry.name}</span>
                    <SubscribeSectionButton
                      sectionId={industry.id}
                      sectionName={industry.name}
                    />
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-5 border-l border-gray-200 pl-3 space-y-1 pb-1">
                      {industry.subsections.map((subsection) => {
                        const isSubExpanded = expandedSubsections.has(
                          subsection.id
                        );
                        return (
                          <div key={subsection.id}>
                            <button
                              onClick={() => toggleSubsection(subsection.id)}
                              className="flex w-full items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-[#2C3E50] transition-colors text-left"
                            >
                              <ChevronDown
                                className={`h-3 w-3 shrink-0 transition-transform ${
                                  isSubExpanded ? "rotate-0" : "-rotate-90"
                                }`}
                              />
                              <span className="flex-1">{subsection.name}</span>
                              <SubscribeSectionButton
                                sectionId={subsection.id}
                                sectionName={subsection.name}
                              />
                            </button>
                            {isSubExpanded && (
                              <div className="ml-4 space-y-0.5 pb-1">
                                {subsection.categories.map((category) => {
                                  const isActive =
                                    selectedCategoryId === category.id;
                                  return (
                                    <button
                                      key={category.id}
                                      onClick={() =>
                                        handleCategoryClick(category.id)
                                      }
                                      className={`block w-full text-left px-3 py-1 text-xs rounded transition-colors ${
                                        isActive
                                          ? "bg-[#0039CA] text-white font-medium"
                                          : "text-gray-400 hover:text-[#0039CA] hover:bg-[#0039CA]/10"
                                      }`}
                                    >
                                      {category.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
      <main className="flex-1 min-w-0 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50]">
            {selectedCategoryId
              ? (() => {
                  const cat = getCategoryName(selectedCategoryId);
                  return cat || "Последние статьи";
                })()
              : "Последние статьи"}
          </h1>
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-sm text-[#0039CA] hover:text-[#2C3E50] transition-colors"
            >
              Сбросить фильтр
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-8">
          {selectedCategoryId
            ? `Статьи в категории «${getCategoryName(selectedCategoryId)}»`
            : "Экспертные материалы по 13 отраслям бизнеса"}
        </p>
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium">Нет статей в этой категории</p>
            <p className="text-sm mt-1">Попробуйте выбрать другую категорию</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredArticles.map((article) => {
              const industry = getIndustryById(article.industryId);
              return (
                <Link
                  key={article.id}
                  href={articleUrl(article)}
                  className="block group rounded-xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0039CA]/10 px-2.5 py-0.5 text-xs font-medium text-[#0039CA]">
                          {industryIcons[article.industryId]}
                          {industry?.name}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-[#2C3E50] group-hover:text-[#0039CA] transition-colors leading-snug mb-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.date}
                        </span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <FavoriteButton articleId={article.id} className="mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function getCategoryName(categoryId: string): string | null {
  for (const ind of industries) {
    for (const sub of ind.subsections) {
      const cat = sub.categories.find((c) => c.id === categoryId);
      if (cat) return cat.name;
    }
  }
  return null;
}
